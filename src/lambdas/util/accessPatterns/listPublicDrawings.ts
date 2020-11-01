import last from 'ramda/src/last'

import drawingEntity from 'lambdas/util/entities/drawing'
import fetchTruncatedTimestamp from 'lambdas/util/fetchTruncatedTimestamp'

import { Drawing, LastEvaluatedKey, DdbIndex } from 'types'

type PublicDrawings = {
    items: Drawing[]
    lastEvaluatedKey?: LastEvaluatedKey
}

export default (startKey?: LastEvaluatedKey): Promise<PublicDrawings> =>
    fetchTruncatedTimestamp<Drawing>({
        limit: 25,
        oldestDateInclusive: '2020-10',
        makeQueryPkFn: (fetchMonth) => `gsi1pkDrawing#${fetchMonth}`,
        index: DdbIndex.GSI1,
        whichPk: 'gsi1pk',
        beginsWith: 'gsi1skDrawing#',
        entity: drawingEntity,
        parseDateFromPkFn: (pk) => {
            const parsedDate = last(pk.split('#'))
            if (parsedDate) {
                return parsedDate
            }
            throw new Error(`Couldnt parse date from pk: ${pk}`)
        },
        startKey,
    })
