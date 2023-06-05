import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { verifyJWT } from 'src/http/middlewares/verify-jwt'

export function invoicesRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.post('/invoices/send', (req: FastifyRequest, reply: FastifyReply) => {})
}
