import { advanceTo } from 'jest-date-mock'
import testUtilDdbScan from 'lambdas/util/testUtilDdbScan'
import createPrivateDrawing from 'lambdas/util/accessPatterns/createPrivateDrawing'
import createUser from 'lambdas/util/accessPatterns/createUser'
import deleteDrawing from 'lambdas/util/accessPatterns/deleteDrawing'

advanceTo(new Date(2020, 5, 29, 0, 0, 0))

const mockUserId = '1234123412341234'
const mockDrawingId = '4321432143214321'
const drawingMockCommon = {
    title: 'mockTitle',
    thumbnailUrl: 'mockThumbnailUrl',
    drawStepsUrl: 'mockDrawStepsUrl',
    startTime: 'mockStartTime',
    endTime: 'mockEndTime',
    width: 1000,
    height: 1000,
    resolution: 2,
    user: mockUserId,
}

test('deleteDrawing', async () => {
    await createUser({ userId: mockUserId, name: 'mock user name' })
    await createPrivateDrawing({
        id: mockDrawingId,
        ...drawingMockCommon,
    })
    const beforeScan = await testUtilDdbScan()
    await deleteDrawing({ drawingId: mockDrawingId, userId: mockUserId })
    const afterScan = await testUtilDdbScan()
    expect(beforeScan).toMatchSnapshot()
    expect(afterScan).toMatchSnapshot()
})

test('deleteDrawing wrong user throws error', async () => {
    await createPrivateDrawing({
        id: mockDrawingId,
        ...drawingMockCommon,
    })

    await expect(
        deleteDrawing({ drawingId: mockDrawingId, userId: 'wronguserid' })
    ).rejects.toThrow()
})
