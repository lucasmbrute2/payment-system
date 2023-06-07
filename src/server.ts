import { Prisma } from '@prisma/client'
import { app } from './app'
import { prisma } from './lib/prisma'
import { env } from './config/env'

async function main() {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`)
  } catch (error) {
    console.error(error)
    throw new Error('DB not connected')
  }
}

main()
  .then(() => {
    app
      .listen({
        port: +env.PORT,
        host: '0.0.0.0',
      })
      .then(() => console.log(`Server running`))
  })
  .catch((error) => console.error(error))
