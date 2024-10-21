import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { randomUUID } from 'crypto'
import { redis } from '../../lib/redis'
import { voting } from '../../utils/voting-pub-sub'

export async function voteOnPoll(request: FastifyRequest, reply: FastifyReply) {
    const voteRequestSchema = z.object({
        pollId: z.string().uuid(),
    })

    const voteOnPollRequestSchema = z.object({
        pollOptionId: z.string().uuid(),
    })

    const { pollId } = voteRequestSchema.parse(request.params)

    const { pollOptionId } = voteOnPollRequestSchema.parse(request.body)

    let { sessionId } = request.cookies

    if (sessionId) {
        const userPreviousVotePoll = await prisma.vote.findUnique({
            where: {
                sessionId_pollId: {
                    sessionId,
                    pollId,
                },
            },
        })

        if (
            userPreviousVotePoll &&
            userPreviousVotePoll.pollOptionId !== pollOptionId
        ) {
            await prisma.vote.delete({
                where: {
                    id: userPreviousVotePoll.id,
                },
            })

            const votes = await redis.zincrby(
                pollId,
                -1,
                userPreviousVotePoll.pollOptionId,
            )

            voting.publish(pollId, {
                pollOptionId: userPreviousVotePoll.pollOptionId,
                votes: Number(votes),
            })
        } else if (userPreviousVotePoll) {
            return reply
                .status(400)
                .send({ message: 'You already vote on this poll.' })
        }
    }

    if (!sessionId) {
        sessionId = randomUUID()

        reply.setCookie('sessionId', sessionId, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 Dias
            signed: true,
            httpOnly: true,
        })
    }

    await prisma.vote.create({
        data: {
            sessionId,
            pollId,
            pollOptionId,
        },
    })

    const votes = await redis.zincrby(pollId, 1, pollOptionId)

    voting.publish(pollId, { pollOptionId, votes: Number(votes) })

    return reply.status(201).send()
}
