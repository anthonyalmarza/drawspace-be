declare module 'dynamodb-toolbox' {

	export enum AttributeTypes {

	}
	export type  DefaultFnArgs = {
		_ct: () => string
  	} & {
    	[key: string]: string
	}
	
	type BatchGetItem = { Key: { [key: string]: string | number }}


	type ObjectAttribute = {
		hidden?: boolean
		sortKey?: boolean
		prefix?: string
		default?: ((record: DefaultFnArgs) => string) | number | string
		partitionKey?: boolean
		alias?: string
		save?: boolean
		type?: string
	}
	type Attribute = ObjectAttribute | (string|number|ObjectAttribute)[]
	type Attributes = {
		[id: string]: Attribute
	}

	export type UpdateReturnValues = 
		'none' 
		| 'all_old'
		| 'updated_old'
		| 'all_new'
		| 'updated_new'

	interface BatchGetResponse {
		Responses: {
			[key: string]: any[]
		}
	}

	export class Table {
		constructor(args: {
			name: string
			partitionKey: string
			sortKey: string
			indexes: {
				[key: string]: {
					partitionKey: string,
					sortKey: string,
				}
			},
			DocumentClient: unknown
		})
		readonly name: string
		readonly batchGet: (keys: BatchGetItem[]) => Promise<BatchGetResponse>
	}

	type DdbQueryReturn = {
		Items: any,
		LastEvaluatedKey: any
	}

	type DdbUpdateReturn = {
		Attributes: any,
	}

	type DdbGetReturn = {
		Item: any,
	}

	interface Conditions {
		attr: string
		beginsWith?: string | number
		exists?: boolean
		eq?: string
	}

	type QueryParams = (
		partitionKey: string,
		options: {
			index?: string,
			limit?: number,
			reverse?: boolean,
			consistent?: boolean,
			beginsWith?: string,
			startKey?: object,
			entity?: string,
			execute?: boolean,
			parse?: boolean,
		}
	) => Promise<DdbQueryReturn>
	export class Entity {
		readonly DocumentClient: any
		readonly table: string
		readonly query: QueryParams

		readonly queryParmas: QueryParams

		readonly update: (
			partitionKey: {
				[key: string]: string | number
			},
			options?: {
				returnValues?: UpdateReturnValues,
				conditions?: Conditions | Conditions[]
			}
		) => Promise<DdbUpdateReturn>

		readonly get: (
			partitionKey: {
				[key: string]: string | number
			},
		) => Promise<DdbGetReturn>

		readonly delete: (
			partitionKey: {
				[key: string]: string | number
			},
			options?: {
				conditions?: Conditions | Conditions[]
			}
		) => Promise<void>

		readonly getBatch: (
			partitionKey: {
				[key: string]: string | number
			},
		) => BatchGetItem
		
		constructor(args: {
			name: string,
			attributes: Attributes,
			table: Table,
		})
	}
}