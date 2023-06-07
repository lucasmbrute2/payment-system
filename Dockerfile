FROM node:18-alpine AS builder

WORKDIR /user/app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .

RUN npm run build

FROM node:19-alpine

COPY --from=builder /user/app/node_modules ./node_modules
COPY --from=builder /user/app/package*.json ./
COPY --from=builder /user/app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3333

CMD ["npm","run","start:migrate:prod"]