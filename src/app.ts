import fastify from 'fastify'
import { env } from './config/env'
import { syndicatesRoutes } from './http/controllers/syndicates/routes'
import { AppError } from './errors/global-error'
import { ZodError } from 'zod'

export const app = fastify()

app.register(require('@fastify/jwt'), {
  secret: env.SECRET_KEY,
})

app.register(syndicatesRoutes)

app.setErrorHandler((error, _, reply) => {
  console.log(error instanceof AppError)
  if (error instanceof ZodError || error instanceof AppError) {
    reply.status(error.statusCode as number).send({
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
