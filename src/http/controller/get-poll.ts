import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function getPoll(request: FastifyRequest, reply: FastifyReply) {
    const requestParamSchema = z.object({
        pollId: z.string().uuid(),
    })

    const { pollId } = requestParamSchema.parse(request.params)

    const poll = await prisma.poll.findUnique({
        where: {
            id: pollId,
        },
        include: {
            options: {
                select: {
                    id: true,
                    title: true,
                },
            },
        },
    })

    if (!poll) {
        return reply.status(404).send({ message: 'Enquete não localizada' })
    }

    return reply.status(200).send({ poll })
}
