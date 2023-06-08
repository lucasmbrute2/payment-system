import { env } from '../config/env'
import { prisma } from './prisma'
import { hash } from 'bcrypt'

// eslint-disable-next-line
(async () => {
  const password = await hash(env.ADMIN_PASSWORD, 6)

  const adminCount = await prisma.syndicate.count()
  const username = `admin-${adminCount + 1}`
  await prisma.$transaction([
    prisma.syndicate.create({
      data: {
        name: 'admin',
        password,
        username,
      },
    }),
  ])

  console.info(`Admin generated`)
})()
