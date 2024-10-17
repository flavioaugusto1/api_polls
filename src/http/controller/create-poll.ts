import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

export async function createPoll(request: FastifyRequest, reply: FastifyReply) {
    const requestBodySchema = z.object({
        title: z.string(),
        options: z.array(z.string()),
    })

    const { title, options } = requestBodySchema.parse(request.body)

    const { id } = await prisma.poll.create({
        data: {
            title,
            options: {
                createMany: {
                    data: options.map((option) => {
                        return { title: option }
                    }),
                },
            },
        },
    })

    return reply.status(201).send({ pollId: id })
}
