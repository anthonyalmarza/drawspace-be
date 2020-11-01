import { advanceTo } from 'jest-date-mock'
import testUtilDdbScan from 'lambdas/util/testUtilDdbScan'
import createPrivateDrawing from 'lambdas/util/accessPatterns/createPrivateDrawing'
import createUser from 'lambdas/util/accessPatterns/createUser'
import getDrawing from 'lambdas/util/accessPatterns/getDrawing'

advanceTo(new Date(2020, 5, 29, 0, 0, 0))

const mockUserId = '1234123412341234'
const mockDrawingId = '4321432143214321'

test('getDrawing', async () => {
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
    await createUser({ userId: mockUserId, name: 'mock user name' })
    await createPrivateDrawing({
        id: mockDrawingId,
        ...drawingMockCommon,
    })

    const res = await getDrawing(mockDrawingId)
    const scan = await testUtilDdbScan()
    expect(res).toMatchSnapshot()
    expect(scan).toMatchSnapshot()
})
