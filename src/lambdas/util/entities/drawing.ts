import { Entity } from 'dynamodb-toolbox'
import table from 'lambdas/util/table'

export default new Entity({
    name: 'drawing',

    attributes: {
        id: { partitionKey: true, prefix: 'drawing#' },
        sk: {
            hidden: true,
            sortKey: true,
            prefix: 'drawing#',
            default: ({ pk }) => pk,
        },

        d: { alias: 'title', type: 'string' },
        p: { alias: 'published', type: 'string' },

        tu: { alias: 'thumbnailUrl', type: 'string' },
        dsu: { alias: 'drawStepsUrl', type: 'string' },
        st: { alias: 'startTime', type: 'string' },
        et: { alias: 'endTime', type: 'string' },
        wi: { alias: 'width', type: 'number' },
        he: { alias: 'height', type: 'number' },
        r: { alias: 'resolution', type: 'number' },
        u: { alias: 'user', type: 'string' },

        // public gsi
        gsi1pk: {
            hidden: true,
            prefix: 'gsi1pkDrawing#',
        },
        gsi1sk: {
            hidden: true,
            prefix: 'gsi1skDrawing#',
        },

        // user gsi
        gsi2pk: {
            hidden: true,
            prefix: 'gsi2pkDrawing#',
            default: ({ user }) => user,
        },
        gsi2sk: {
            hidden: true,
            prefix: 'gsi2skDrawing#',
            default: ({ _ct, published }) =>
                `${published ? 'public' : 'private'}#${_ct()}`,
        },
    },

    table,
})
