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
        email: z.string().email(),
        apartament: z.number(),
        cpf: z.string(),
        address: z.object({
          street: z.string(),
          number: z.string(),
          complement: z.string().optional(),
          locality: z.string(),
          city: z.string(),
          region: z.string(),
          region_code: z.string(),
          country: z.string().optional(),
          postalCode: z.string(),
        }),
        phone: z.object({
          area: z.number(),
          number: z.number(),
          type: z
            .enum(['MOBILE', 'BUSINESS', 'HOME'])
            .default('MOBILE')
            .optional(),
        }),
      })

      const createResidentParamsSchema = z.object({
        buildingId: z.string(),
        addressId: z.string().optional(),
      })
      const { apartament, cpf, name, email, address, phone } =
        createResidentSchema.parse(req.body)

      const { area, number: phoneNumber } = phone
      const {
        city,
        locality,
        number,
        postalCode,
        region,
        region_code,
        street,
      } = address
      const params = createResidentParamsSchema.parse(req.params)
      const { buildingId } = params
      const resident = await prisma.resident.findMany({
        where: {
          OR: [
            {
              cpf,
            },
            {
              email,
            },
          ],
        },
      })
      if (resident.length) throw new AppError('Resident already exists', 400)

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
          building: {
            connect: {
              id: buildingId,
            },
          },
          email,
          address: {
            connectOrCreate: {
              create: {
                city,
                complement: address.complement ?? '',
                locality,
                number,
                postalCode,
                region,
                region_code,
                street,
              },
              where: {
                id: params?.addressId ?? '',
              },
            },
          },
          Phone: {
            create: {
              area,
              number: phoneNumber,
            },
          },
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
