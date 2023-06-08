import 'dotenv/config'
import { AppError } from 'src/errors/global-error'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.string().default('0.0.0.0'),
  SECRET_KEY: z.string(),
  CRON_SCHEDULE: z.string(),
  PAYMENT_URL: z.string(),
  PAYMENT_ACCESS_TOKEN: z.string(),
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
  ADMIN_PASSWORD: z.string(),
})

const _env = envSchema.safeParse(process.env)
if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())
  throw new AppError(_env.error.stack as string, 500)
}

export const env = _env.data
