import { CronJob } from 'cron'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { Invoices, Resident } from '@prisma/client'

const actualMonth = new Date().getMonth() + 1

type ResidentWithInvoice = Resident & {
  Invoices: Invoices[]
}

async function checkPreviousInvoice(residents: ResidentWithInvoice[]) {
  residents.forEach(async (resident) => {
    const previousInvoice = resident.Invoices.filter(
      (invoice) => !invoice.isPaid && invoice.month !== actualMonth,
    )
    if (!previousInvoice.length) return
    await prisma.resident.update({
      where: {
        id: resident.id,
      },
      data: {
        nonPayments: previousInvoice?.length,
      },
    })
  })
}

async function createInvoices() {
  const residents = await prisma.resident.findMany({
    where: {
      leftAt: null,
    },
    include: {
      Invoices: true,
    },
  })
  const invoicesData = residents.map((resident) => {
    return {
      amount: 150,
      month: actualMonth,
      residentId: resident.id,
    }
  })
  await prisma.invoices.createMany({
    data: invoicesData,
  })

  await checkPreviousInvoice(residents)
}

export const invoiceJob = new CronJob(
  env.CRON_SCHEDULE,
  createInvoices,
  null,
  true,
  'America/Sao_Paulo',
)
