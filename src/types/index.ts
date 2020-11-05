export enum Method {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
}

export interface AjaxParams {
    url: string
    method: Method
    body?: Record<string, unknown>
    queryParams?: Record<string, unknown>
    headers?: { 'Content-Type'?: string }
    ssl?: boolean
    formData?: Record<string, unknown>
}

export type LastEvaluatedKey = {
    gsi1pk: string
    gsi1sk: string
    pk: string
    sk: string
}

export enum DdbIndex {
    PRIMARY = '',
    GSI1 = 'gsi1',
    GSI2 = 'gsi2',
}

export enum UpdateReturnValues {
    NONE = 'none',
    ALL_OLD = 'all_old',
    UPDATED_OLD = 'updated_old',
    ALL_NEW = 'all_new',
    UPDATED_NEW = 'updated_new',
}

// Entities
export interface User {
    id: string
    name: string
    privateDrawingCount: number
    publicDrawingCount: number
    created: string
    modified: string
}

export interface Drawing {
    id: string
    title: string
    published: string
    thumbnailUrl: string
    drawStepsUrl: string
    startTime: string
    endTime: string
    width: number
    height: number
    resolution: number
    user: string
    created: string
    modified: string
}
