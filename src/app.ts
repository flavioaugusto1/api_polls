import fastify from 'fastify'
import { appRoutes } from './http/app.routes'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie, {
    secret: 'polls-api-app',
    hook: 'onRequest',
    parseOptions: {},
})

app.register(appRoutes)
