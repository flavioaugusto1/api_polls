import { FastifyInstance } from 'fastify'
import { createPoll } from './controller/create-poll'

export async function appRoutes(app: FastifyInstance) {
    app.post('/poll', createPoll)
}
