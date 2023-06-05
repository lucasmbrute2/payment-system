import { CronJob } from 'cron'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { Address, Invoices, Phone, Resident } from '@prisma/client'
import { paymentAxios } from '../lib/axios'
import { makePaymentInvoicePayload } from '../helpers/make-payment-payload'

const actualMonth = new Date().getMonth() + 1

export type ResidentWithInvoice = Resident & {
  Invoices: Invoices[]
  address: Address
  Phone: Phone[]
}

async function sentResidentNonPayments(residents: ResidentWithInvoice[]) {
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

async function sendMailWithInvoicesToResidents(
  residents: ResidentWithInvoice[],
) {
  const orderPromises = residents.map((resident) => {
    return paymentAxios.post('orders', makePaymentInvoicePayload(resident))
  })
  const [response] = await Promise.all(orderPromises)
  console.log(response.data.charges[0].links)
  // TODO send mail
}

async function createInvoices() {
  const residents = await prisma.resident.findMany({
    where: {
      leftAt: null,
    },
    include: {
      Invoices: true,
      address: true,
      Phone: true,
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

  await sentResidentNonPayments(residents)
  await sendMailWithInvoicesToResidents(residents)
}

export const invoiceJob = new CronJob(
  env.CRON_SCHEDULE,
  createInvoices,
  null,
  false,
  'America/Sao_Paulo',
)
