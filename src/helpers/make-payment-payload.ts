import { ResidentWithInvoice } from '../cron/invoices'
import { AppError } from '../errors/global-error'
import { randomUUID } from 'node:crypto'
import { ISODateWithNextMonth } from './dates'

interface Phone {
  country: number
  area: number
  number: number
  type: 'MOBILE' | 'BUSINESS' | 'HOME'
}

interface Item {
  rereference_id: string
  name: string
  quantity: number
  unit_amount: number
}

interface Address {
  street: string
  number: string
  complement?: string
  locality: string
  city: string
  region_code: string
  region?: string
  country: string
  postal_code: string
}

interface Charge {
  reference_id: string
  description: string
  amount: {
    value: number
    currency: string
  }
  payment_method: {
    type: 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD'
    boleto: {
      due_date: string
      instruction_lines: {
        line_1: string
        line_2: string
      }
      holder: {
        name: string
        tax_id: string
        email: string
        address: Address
      }
    }
  }
}

interface Order {
  reference_id: string
  customer: {
    name: string
    email: string
    tax_id: string
    phones: Phone[]
  }
  items: Item[]
  shipping: {
    address: Address
  }
  notification_urls?: String[]
  charges: Charge[]
}

export const makePaymentInvoicePayload = (
  resident: ResidentWithInvoice,
): Order => {
  const { name, cpf, Phone, address } = resident
  const {
    city,
    country,
    locality,
    number: addressNumber,
    postalCode,
    region_code,
    street,
    region,
  } = address

  if (!Phone?.length) throw new AppError('Resident phone was not found', 500)

  const { area, countryCode, number, type } = Phone[0]

  return {
    customer: {
      name,
      tax_id: cpf,
      email: 'lucas2@gmail.com',
      phones: [
        {
          area,
          country: countryCode,
          number,
          type,
        },
      ],
    },
    items: [
      {
        rereference_id: 'invoiceID',
        name: 'Condomínio',
        quantity: 1,
        unit_amount: 15000,
      },
    ],
    shipping: {
      address: {
        city,
        country,
        locality,
        number: addressNumber,
        region_code,
        postal_code: postalCode,
        street,
      },
    },
    reference_id: randomUUID(),
    charges: [
      {
        reference_id: 'invoiceID',
        description: 'Condomínio',
        amount: {
          value: 15000,
          currency: 'BRL',
        },
        payment_method: {
          type: 'BOLETO',
          boleto: {
            due_date: ISODateWithNextMonth(),
            instruction_lines: {
              line_1: 'Pagamento processado para DESC Fatura',
              line_2: 'Via PagSeguro',
            },
            holder: {
              email: 'test@gmail.com',
              name,
              tax_id: cpf,
              address: {
                city,
                country,
                locality,
                number: addressNumber,
                postal_code: postalCode,
                region_code,
                street,
                region,
              },
            },
          },
        },
      },
    ],
  }
}
