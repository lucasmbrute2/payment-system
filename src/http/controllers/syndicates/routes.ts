import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from 'src/errors/global-error'
import { prisma } from 'src/lib/prisma'
import { z } from 'zod'

export async function syndicatesRoutes(app: FastifyInstance) {
  app.post('/syndicates', async (req: FastifyRequest, reply: FastifyReply) => {
    const createBodySchema = z.object({
      name: z.string(),
      username: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
    })

    const { name, username, password, confirmPassword } =
      createBodySchema.parse(req.body)

    const syndicateAlreadyExists = await prisma.syndicate.findUnique({
      where: {
        username,
      },
    })

    if (syndicateAlreadyExists) {
      return new AppError('Syndicate already exits', 404)
    }

    if (password !== confirmPassword) {
      return new AppError('Password do not match', 409)
    }

    const response = await prisma.syndicate.create({
      data: {
        name,
        username,
        password,
      },
      include: {
        Block: true,
      },
    })

    return reply.status(201).send({
      syndicate: response,
    })
  })

  app.post('/sessions', async (req: FastifyRequest, reply: FastifyReply) => {})
}
