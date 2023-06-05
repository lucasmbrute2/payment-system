import axios from 'axios'
import { env } from '../config/env'

export const paymentAxios = axios.create({
  baseURL: env.PAYMENT_URL,
  headers: {
    Authorization: `Bearer ${env.PAYMENT_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
})
