import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { z } from 'zod'
import { prisma } from 'src/lib/prisma'
import { AppError } from 'src/errors/global-error'

export async function blockRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/block', async (req: FastifyRequest, reply: FastifyReply) => {
    const createBlockSchema = z.object({
      number: z.number(),
    })
    const { number } = createBlockSchema.parse(req.body)
    const blockAlreadyExists = await prisma.block.findUnique({
      where: {
        number,
      },
    })

    if (blockAlreadyExists) {
      throw new AppError('Block alreay exists', 404)
    }

    const response = await prisma.block.create({
      data: {
        number,
        syndicateId: req.user.sub,
      },
    })

    return reply.status(200).send({
      block: response,
    })
  })

  app.get('/blocks', async (req: FastifyRequest, reply: FastifyReply) => {
    const blocks = await prisma.block.findMany({
      where: {
        syndicateId: req.user.sub,
      },
    })

    return reply.status(200).send({
      blocks,
    })
  })
}
