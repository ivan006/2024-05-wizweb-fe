import { Model } from '@vuex-orm/core'

// import { DefaultSISHeadersAndBaseUrl } from '@v2/models/sis/SISHeaders'
import CustonMixins from '../mixins/CustonMixins'
import Helpers from '../utils/Helpers'

export default class DBBaseModel extends Model {
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
    ) {
        let offset = (options.page - 1) * options.limit
        // todo: note - i hade to put the filters in line because urls can have duplicates keys and objects cans and i needed duplicates key support for the date range filter

        return this.customApiBase(headers)
            .get(`${url}?${Helpers.prepareFiltersForAxios(options.filters)}`, {
                persistBy: 'insertOrUpdate',
                params: {
                    ...{
                        limit: options.limit,
                        offset: offset,
                    },
                    ...flags,
                    ...Helpers.prepareRelationsForAxios(relationships),
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

    static FetchById( id, relationships = [], flags = {}, headers = {} ) {
        relationships
        return this.customSupabaseApiFetchById(
            `${this.baseUrl}/rest/v1/provider_groups?id=eq.${id}&select=*`,
            id,
            relationships,
            flags,
            this.mergeHeaders(headers)
        )
    }


    static customSupabaseApiFetchById(url, id, relationships = [], flags = {}, headers = {} ) {
        relationships
        return this.customApiBase(headers)
            .get(url, {
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

    static customSupabaseApiStore(url, entity, relationships = [], flags = {}, headers = {} ) {
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

    static customSupabaseApiUpsert(url, entity, relationships = [], flags = {}, headers = {} ) {
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

    static customSupabaseApiUpdate(url, entity, relationships = [], flags = {}, headers = {} ) {
        return this.customApiBase(headers)
            .patch(
                url,
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

    static customSupabaseApiDelete(url, entityId, flags = {}, headers = {} ) {
        return this.customApiBase(headers)
            .delete(url, {
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
