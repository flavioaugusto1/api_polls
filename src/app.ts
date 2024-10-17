import fastify from 'fastify'
import { appRoutes } from './http/app.routes'

export const app = fastify()

app.register(appRoutes)
