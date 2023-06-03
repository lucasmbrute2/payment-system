import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './config/env'

export const app = fastify()

app.register(require('@fastify/jwt'), {
  secret: env.SECRET_KEY,
})

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.format(),
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO Sentry
  }
})
