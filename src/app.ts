import fastify from 'fastify'
import { appRoutes } from './http/app.routes'
import cookie from '@fastify/cookie'
import websocket from '@fastify/websocket'
import { pollResults } from './http/ws/poll-results'

export const app = fastify()

app.register(websocket)

app.register(cookie, {
    secret: 'polls-api-app',
    hook: 'onRequest',
    parseOptions: {},
})

app.register(pollResults)
app.register(appRoutes)
