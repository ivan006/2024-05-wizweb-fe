import { Model } from '@vuex-orm/core'

// import { DefaultSISHeadersAndBaseUrl } from '@v2/models/sis/SISHeaders'
import CustonMixins from '../mixins/CustonMixins'
import Helpers from '../utils/Helpers'

export default class DBBaseModel extends Model {

    static adapator = 'supabase'
    static primaryKey = 'id';

    static customApiBase(moreHeaders) {
        const baseUrlAndHeaders =
            CustonMixins.methods.DefaultHeadersAndBaseUrl()
        this.apiConfig = {
            // ...DefaultSISHeadersAndBaseUrl(),
            // baseURL: baseUrlAndHeaders.baseURL,
            baseURL: "",
            headers: {
                ...baseUrlAndHeaders.headers,
                ...moreHeaders,
            },
        }
        return this.api()
    }

    static customSupabaseApiFetchAll(
        url,
        relationships = [],
        flags = {},
        headers = {},
        options = {
            page: 1,
            limit: 15,
            filters: {},
            clearPrimaryModelOnly: false
        },
        adapator = "supabase"
    ) {
        let offset = (options.page - 1) * options.limit
        // todo: note - i hade to put the filters in line because urls can have duplicates keys and objects cans and i needed duplicates key support for the date range filter

        let computedUrl = url
        let preparedRels = {}

        if (adapator === "supabase"){

            computedUrl= `${url}?${Helpers.prepareFiltersForSupabase(options.filters)}`
            preparedRels = Helpers.prepareRelationsForSupabase(relationships)

        } else if(adapator === "laravel") {

            computedUrl= `${url}?${Helpers.prepareFiltersForLaravel(options.filters)}`
            preparedRels = Helpers.prepareRelationsForLaravel(relationships)

        }

        return this.customApiBase(headers)
            .get(computedUrl, {
                persistBy: 'insertOrUpdate',
                params: {
                    ...{
                        limit: options.limit,
                        offset: offset,
                    },
                    ...flags,
                    ...preparedRels,
                },
                dataTransformer: ({ data }) => {
                    if (options.clearPrimaryModelOnly) {
                        this.deleteAll()
                    }
                    const result = CustonMixins.methods.NormalizeRecursive(data)
                    return result
                },
            })
            .then((res) => {
                return res
            })
            .catch((error) => {
                // CustonMixins.methods.logNetworkError(error)
                // return error // < would this be needed maybe?
            })
    }

    static customSupabaseApiFetchById(url, id, relationships = [], flags = {}, headers = {} , adapator = "supabase") {
        relationships

        let computedUrl = url
        if (adapator === "supabase"){
            computedUrl= `${url}?id=eq.${id}`
        } else if(adapator === "laravel") {
            computedUrl = `${url}/${id}`
        }

        return this.customApiBase(headers)
            .get(computedUrl, {
                dataTransformer: ({ data }) => {
                    const result = CustonMixins.methods.NormalizeRecursive(data)
                    return result
                },
            })
            .then((res) => {
                return res
            })
            .catch((error) => {
                // CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiStore(url, entity, relationships = [], flags = {}, headers = {} , adapator = "supabase") {
        return this.customApiBase(headers)
            .post(
                url,
                { ...entity },
                {
                    dataTransformer: ({ data }) => {
                        const result =
                            CustonMixins.methods.NormalizeRecursive(data)
                        return result
                    },
                }
            )
            .then((res) => {
                CustonMixins.methods.logNetworkSuccess(res)
                return res
            })
            .catch((error) => {
                // CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiUpsert(url, entity, relationships = [], flags = {}, headers = {} , adapator = "supabase") {
        return this.customApiBase(headers)
            .post(
                url,
                { ...entity },
                {
                    dataTransformer: ({ data }) => {
                        const result =
                            CustonMixins.methods.NormalizeRecursive(data)
                        return result
                    },
                }
            )
            .then((res) => {
                CustonMixins.methods.logNetworkSuccess(res)
                return res
            })
            .catch((error) => {
                // CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiUpdate(url, entity, relationships = [], flags = {}, headers = {} , adapator = "supabase") {

        let computedUrl = url
        if (adapator === "supabase"){
            computedUrl = `${url}?id=eq.${entity.id}`
        } else if(adapator === "laravel") {
            computedUrl = `${url}/${entity.id}`
        }

        return this.customApiBase(headers)
            .patch(
                computedUrl,
                { ...entity },
                {
                    dataTransformer: ({ data }) => {
                        const result =
                            CustonMixins.methods.NormalizeRecursive(data)
                        return result
                    },
                    save: true,
                }
            )
            .then((res) => {
                CustonMixins.methods.logNetworkSuccess(res)
                return res
            })
            .catch((error) => {
                // CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiDelete(url, entityId, flags = {}, headers = {} , adapator = "supabase") {

        let computedUrl = url
        if (adapator === "supabase"){
            computedUrl = `${url}?id=eq.${entityId}`
        } else if(adapator === "laravel") {
            computedUrl = `${url}/${entityId}`
        }

        return this.customApiBase(headers)
            .delete(computedUrl, {
                delete: entityId,
            })
            .then((res) => {
                CustonMixins.methods.logNetworkSuccess(res)
                return res
            })
            .catch((error) => {
                // CustonMixins.methods.logNetworkError(error)
            })
    }
}
