import { advanceTo } from 'jest-date-mock'
import testUtilDdbScan from 'lambdas/util/testUtilDdbScan'
import createUser from 'lambdas/util/accessPatterns/createUser'
import bulkGetUser from 'lambdas/util/accessPatterns/bulkGetUser'

advanceTo(new Date(2020, 5, 29, 0, 0, 0))

test('bulkGetUser', async () => {
    await Promise.all(
        Array.from({ length: 5 }, (x, i) =>
            createUser({ userId: i.toString(), name: 'mock user name' })
        )
    )

    const res = await bulkGetUser(['0', '1', '2', '3', '4', '5'])
    const scan = await testUtilDdbScan()
    expect(res).toMatchSnapshot()
    expect(scan).toMatchSnapshot()
})
