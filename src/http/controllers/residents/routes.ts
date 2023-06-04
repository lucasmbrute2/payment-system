import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from 'src/errors/global-error'
import { verifyJWT } from 'src/http/middlewares/verify-jwt'
import { prisma } from 'src/lib/prisma'
import { z } from 'zod'

export async function residentRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post(
    '/resident/:buildingId',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const createResidentSchema = z.object({
        name: z.string(),
        apartament: z.number(),
        cpf: z.string(),
      })

      const createResidentParamsSchema = z.object({
        buildingId: z.string(),
      })
      const { apartament, cpf, name } = createResidentSchema.parse(req.body)
      const { buildingId } = createResidentParamsSchema.parse(req.params)

      const resident = await prisma.resident.findUnique({
        where: {
          cpf,
        },
      })
      if (resident) throw new AppError('Resident already exists', 400)

      const hasBuilding = await prisma.building.findUnique({
        where: {
          id: buildingId,
        },
      })
      if (!hasBuilding) throw new AppError('Building not found', 404)

      const response = await prisma.resident.create({
        data: {
          apartament,
          cpf,
          name,
          buildingId,
        },
      })

      reply.status(201).send({
        resident: response,
      })
    },
  )

  app.get('/residents', async (req: FastifyRequest, reply: FastifyReply) => {
    const residents = await prisma.resident.findMany({
      where: {
        leftAt: null,
      },
      include: {
        Invoices: true,
        building: true,
      },
    })

    const residentsWithoutBuildingId = residents.map((resident) => {
      const { buildingId, ...rest } = resident
      return rest
    })

    return reply.status(200).send({
      residents: residentsWithoutBuildingId,
    })
  })

  app.patch(
    '/left/:residentId',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const leftResidentSchemaParams = z.object({
        residentId: z.string(),
      })

      const { residentId } = leftResidentSchemaParams.parse(req.params)

      const resident = await prisma.resident.findUnique({
        where: {
          id: residentId,
        },
      })

      if (!resident) throw new AppError('Resident not found', 404)
      await prisma.resident.update({
        data: {
          leftAt: new Date(),
        },
        where: {
          id: residentId,
        },
      })

      reply.status(200).send()
    },
  )
}
