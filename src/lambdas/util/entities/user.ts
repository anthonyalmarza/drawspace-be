import { Entity } from 'dynamodb-toolbox'

import table from 'lambdas/util/table'

export default new Entity({
    name: 'user',

    attributes: {
        id: { partitionKey: true, prefix: 'user#' },
        sk: {
            hidden: true,
            sortKey: true,
            prefix: 'user#',
            default: ({ pk }) => pk,
        },

        n: { alias: 'name', type: 'string' },
        dc: { alias: 'privateDrawingCount', type: 'number', default: 0 },
        pdc: { alias: 'publicDrawingCount', type: 'number', default: 0 },
    },

    table,
})
