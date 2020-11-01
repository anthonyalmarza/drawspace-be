import { advanceTo } from 'jest-date-mock'
import testUtilDdbScan from 'lambdas/util/testUtilDdbScan'
import createPublicDrawing from 'lambdas/util/accessPatterns/createPublicDrawing'
import createUser from 'lambdas/util/accessPatterns/createUser'
import listPublicDrawings from 'lambdas/util/accessPatterns/listPublicDrawings'

const mockUserIds = ['1', '2']

test('listPublicDrawings', async () => {
    const drawingMockCommon = {
        title: 'mockTitle',
        thumbnailUrl: 'mockThumbnailUrl',
        drawStepsUrl: 'mockDrawStepsUrl',
        startTime: 'mockStartTime',
        endTime: 'mockEndTime',
        width: 1000,
        height: 1000,
        resolution: 2,
    }
    advanceTo(new Date(2020, 10, 10, 0, 0, 0))
    await Promise.all([
        createUser({ userId: mockUserIds[0], name: 'mock user name 1' }),
        createUser({ userId: mockUserIds[1], name: 'mock user name 2' }),
    ])
    await Array.from({ length: 10 }, (x, i) => i).reduce(async (p, id) => {
        await p
        advanceTo(new Date(2020, 9, 31, id, 0, 0))
        return createPublicDrawing({
            id: id.toString(),
            user: mockUserIds[id % 2 === 0 ? 0 : 1],
            ...drawingMockCommon,
        })
    }, Promise.resolve())
    const scan = await testUtilDdbScan()
    const res = await listPublicDrawings()
    expect(res).toMatchSnapshot()
    expect(scan).toMatchSnapshot()
})
