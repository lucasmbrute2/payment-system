import fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { env } from './config/env'
import { syndicatesRoutes } from './http/controllers/syndicates/routes'
import { AppError } from './errors/global-error'
import { ZodError } from 'zod'
import { blockRoutes } from './http/controllers/blocks/routes'

export const app = fastify()

app.register(fastifyJwt, {
  secret: env.SECRET_KEY,
  sign: {
    expiresIn: '7d',
  },
})

app.register(syndicatesRoutes)
app.register(blockRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError || error instanceof AppError) {
    reply.status(400).send({
      message: 'Validation error',
      issues: error instanceof ZodError ? error?.format() : error.message,
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO Sentry
  }

  reply.status(500).send({
    message: 'Internal server error',
  })
})
