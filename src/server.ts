import { Prisma } from '@prisma/client'
import { app } from './app'
import { prisma } from './lib/prisma'

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
        port: 3333,
      })
      .then(() => console.log(`Server running`))
  })
  .catch((error) => console.error(error))
