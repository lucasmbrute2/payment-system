import { compare } from 'bcrypt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { AppError } from 'src/errors/global-error'
import { prisma } from 'src/lib/prisma'
import { z } from 'zod'

export async function syndicatesRoutes(app: FastifyInstance) {
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
