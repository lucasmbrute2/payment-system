import { CronJob } from 'cron'
import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { Address, Invoices, Phone, Resident } from '@prisma/client'
import { paymentAxios } from '../lib/axios'
import { makePaymentInvoicePayload } from '../helpers/make-payment-payload'
import { createTransport } from 'nodemailer'
import Mail from 'nodemailer/lib/mailer'

const actualMonth = new Date().getMonth() + 1

export type ResidentWithInvoice = Resident & {
  Invoices: Invoices[]
  address: Address
  Phone: Phone[]
}

async function setResidentNonPayments(residents: ResidentWithInvoice[]) {
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

async function getInvoices(residents: ResidentWithInvoice[]) {
  const orderPromises = residents.map((resident) => {
    return paymentAxios.post('orders', makePaymentInvoicePayload(resident))
  })
  const [response] = await Promise.all(orderPromises)
  return response.data.charges[0].links[0].href
}

async function sendMailWithInvoicesToResidents(
  residents: ResidentWithInvoice[],
) {
  const invoiceInPDF = await getInvoices(residents)
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: 'lucasmbrute614@gmail.com',
      pass: 'awoblduzmdbjqibd',
    },
  })

  residents.forEach(({ email }) => {
    const mailOptions: Mail.Options = {
      from: 'leumamou@gmail.com',
      to: email,
      subject: 'Boleto',
      text: 'Segue em anexo o Boleto do condomínio',
      attachments: [
        {
          path: invoiceInPDF,
          contentType: 'application/pdf',
          filename: 'Boleto',
        },
      ],
    }

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })
  })
}

async function saveInvoicesOnDb(residents: ResidentWithInvoice[]) {
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
}

async function createInvoices() {
  console.info('Starting cron to create invoices')

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
  await saveInvoicesOnDb(residents)
  await setResidentNonPayments(residents)
  await sendMailWithInvoicesToResidents(residents)
  console.info('End cron to create invoices')
}

export const invoiceJob = new CronJob(
  env.CRON_SCHEDULE,
  createInvoices,
  null,
  true,
  'America/Sao_Paulo',
)
