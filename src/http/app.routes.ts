import { FastifyInstance } from 'fastify'
import { createPoll } from './controller/create-poll'
import { getPoll } from './controller/get-poll'

export async function appRoutes(app: FastifyInstance) {
    app.post('/poll', createPoll)
    app.get('/poll/:pollId', getPoll)
}
