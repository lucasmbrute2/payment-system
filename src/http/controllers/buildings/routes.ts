import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AppError } from 'src/errors/global-error'
import { verifyJWT } from 'src/http/middlewares/verify-jwt'
import { prisma } from 'src/lib/prisma'
import { z } from 'zod'

export async function buildingRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post(
    '/buildings/:blockId',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const createBuildingParamsSchema = z.object({
        blockId: z.string().uuid(),
      })
      const createBuildingSchema = z.object({
        buildingNumber: z.number(),
      })

      const { buildingNumber } = createBuildingSchema.parse(req.body)
      const { blockId } = createBuildingParamsSchema.parse(req.params)

      const block = await prisma.block.findUnique({
        where: {
          id: blockId,
        },
      })
      if (!block) {
        throw new AppError('Block not found', 404)
      }

      const buldingAlreadyExists = await prisma.building.findUnique({
        where: {
          buildingNumber,
        },
      })

      if (buldingAlreadyExists) {
        throw new AppError('Bulding already exists', 404)
      }

      const response = await prisma.building.create({
        data: {
          buildingNumber,
          blockId,
        },
      })

      return reply.status(200).send({
        block: response,
      })
    },
  )

  app.get('/buildings', async (req: FastifyRequest, reply: FastifyReply) => {
    const buildings = await prisma.building.findMany()

    return reply.status(200).send({
      buildings,
    })
  })
}
