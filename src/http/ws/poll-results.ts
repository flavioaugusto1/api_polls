import { FastifyInstance } from 'fastify'
import { voting } from '../../utils/voting-pub-sub'
import { z } from 'zod'

export async function pollResults(app: FastifyInstance) {
    app.get(
        '/poll/:pollId/results',
        { websocket: true },
        (connection, request) => {
            const voteRequestSchema = z.object({
                pollId: z.string().uuid(),
            })

            const { pollId } = voteRequestSchema.parse(request.params)

            voting.subscribe(pollId, (message) => {
                connection.socket.send(JSON.stringify(message))
            })
        },
    )
}
