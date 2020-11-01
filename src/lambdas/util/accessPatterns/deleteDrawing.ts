import drawingEntity from 'lambdas/util/entities/drawing'

export default async ({
    drawingId,
    userId,
}: {
    drawingId: string
    userId: string
}): Promise<void> => {
    await drawingEntity.delete(
        { id: drawingId, userId },
        { conditions: { attr: 'user', eq: userId } }
    )
}
