import dayjs from 'dayjs'

import isNil from 'ramda/src/isNil'

import { Entity as DdbToolboxEntity } from 'dynamodb-toolbox'
import { LastEvaluatedKey, DdbIndex } from 'types'

type MakeQueryPkFn = (fetchMonth: string) => string

interface FetchTruncatedTimestampArgCommon {
    limit?: number
    startKey?: LastEvaluatedKey
    makeQueryPkFn: MakeQueryPkFn
    entity: DdbToolboxEntity
    beginsWith: string
    index: DdbIndex
    whichPk: keyof LastEvaluatedKey
    parseDateFromPkFn: (pk: string) => string
}

interface FetchTruncatedTimestampArgMonthsAgo
    extends FetchTruncatedTimestampArgCommon {
    oldestDateInclusive?: string
    maxMonthsAgo: number
}

interface FetchTruncatedTimestampArgOldestMonth
    extends FetchTruncatedTimestampArgCommon {
    maxMonthsAgo?: number
    oldestDateInclusive: string
}

const reachedEnd = ({
    fetchMonth,
    oldestDateInclusive,
    monthsAgo,
    maxMonthsAgo,
}: {
    fetchMonth?: string
    oldestDateInclusive?: string
    monthsAgo?: number
    maxMonthsAgo?: number
}) => {
    if (oldestDateInclusive && fetchMonth) {
        return oldestDateInclusive <= fetchMonth
    }
    if (!isNil(monthsAgo) && maxMonthsAgo) {
        return monthsAgo < maxMonthsAgo
    }
    return false
}

const createFetchItems = <TResult>({
    makeQueryPkFn,
    entity,
    beginsWith,
    index,
}: {
    makeQueryPkFn: MakeQueryPkFn
    entity: DdbToolboxEntity
    beginsWith: string
    index: string
}) => async ({
    limit,
    startKey,
    fetchMonth,
}: {
    limit: number
    startKey?: LastEvaluatedKey
    fetchMonth: string
}): Promise<{
    items: TResult[]
    lastEvaluatedKey: LastEvaluatedKey
}> => {
    const queryKey = makeQueryPkFn(fetchMonth)
    const {
        LastEvaluatedKey: lastEvaluatedKey,
        Items: records,
    } = await entity.query(queryKey, {
        beginsWith,
        reverse: true,
        limit,
        ...(index !== DdbIndex.PRIMARY ? { index } : {}),
        ...(startKey ? { startKey } : {}),
    })
    return { items: records, lastEvaluatedKey }
}

const fetchTruncatedTimestamp = async <TResult>({
    limit = 25,
    maxMonthsAgo,
    oldestDateInclusive,
    makeQueryPkFn,
    entity,
    beginsWith,
    index,
    whichPk,
    parseDateFromPkFn,
    startKey,
}:
    | FetchTruncatedTimestampArgMonthsAgo
    | FetchTruncatedTimestampArgOldestMonth): Promise<{
    items: TResult[]
    lastEvaluatedKey?: LastEvaluatedKey
}> => {
    let allResults: TResult[] = []
    let monthsAgo = 0
    const startDate = startKey
        ? dayjs(parseDateFromPkFn(startKey[whichPk]))
        : dayjs()
    let fetchMonth = startDate.format('YYYY-MM')
    let lastLastEvaluatedKey = startKey
    const fetchItems = createFetchItems<TResult>({
        makeQueryPkFn,
        entity,
        beginsWith,
        index,
    })

    while (
        allResults.length < limit &&
        reachedEnd({
            maxMonthsAgo,
            monthsAgo,
            oldestDateInclusive,
            fetchMonth,
        })
    ) {
        // eslint-disable-next-line no-await-in-loop
        const { items, lastEvaluatedKey } = await fetchItems({
            fetchMonth,
            startKey: lastLastEvaluatedKey,
            limit,
        })
        allResults = [...allResults, ...items]
        lastLastEvaluatedKey = lastEvaluatedKey
        if (!lastEvaluatedKey) {
            monthsAgo += 1
            fetchMonth = startDate
                .subtract(monthsAgo, 'month')
                .format('YYYY-MM')
        }
    }
    return { items: allResults, lastEvaluatedKey: lastLastEvaluatedKey }
}

export default fetchTruncatedTimestamp
