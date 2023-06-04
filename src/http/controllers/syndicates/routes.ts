import { compare, hash } from 'bcrypt'
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
      throw new AppError('Syndicate already exits', 404)
    }

    if (password !== confirmPassword) {
      throw new AppError('Password do not match', 409)
    }

    const response = await prisma.syndicate.create({
      data: {
        name,
        username,
        password: await hash(password, 6),
      },
      include: {
        Block: true,
      },
    })

    return reply.status(201).send({
      syndicate: response,
    })
  })

  app.post('/sessions', async (req: FastifyRequest, reply: FastifyReply) => {
    const authBodySchema = z.object({
      username: z.string(),
      password: z.string(),
    })

    const { username, password } = authBodySchema.parse(req.body)
    const syndicate = await prisma.syndicate.findUnique({
      where: {
        username,
      },
    })
    if (!syndicate) {
      throw new AppError('Username or password incorrect', 409)
    }

    const passwordIsCorrect = compare(password, syndicate?.password as string)
    if (!passwordIsCorrect) {
      throw new AppError('Username or password incorrect', 409)
    }

    const token = await reply.jwtSign(
      {},
      {
        sign: {
          sub: syndicate.id,
        },
      },
    )

    const { password: removePasswordFromResponse, ...viewSyndicate } = syndicate
    return reply.status(200).send({
      syndicate: viewSyndicate,
      token,
    })
  })
}
