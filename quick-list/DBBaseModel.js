import { Model } from '@vuex-orm/core'

// import { DefaultSISHeadersAndBaseUrl } from '@v2/models/sis/SISHeaders'
import CustonMixins from '@/2024-05-vue-orm-ui/mixins/CustonMixins'
import Helpers from '@/utils/Helpers'

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
        options = { flags: {}, moreHeaders: {}, rels: [] },
        // { page = 1, limit = 15 },
        // filters = {},
        // flags = {},
        // moreHeaders,
        // clearPrimaryModelOnly = false
    ) {
        let offset = (options.page - 1) * options.limit
        // todo: note - i hade to put the filters in line because urls can have duplicates keys and objects cans and i needed duplicates key support for the date range filter

        return this.customApiBase(options.moreHeaders)
            .get(`${url}?${Helpers.prepareFiltersForAxios(options.filters)}`, {
                persistBy: 'insertOrUpdate',
                params: {
                    ...{
                        limit: options.limit,
                        offset: offset,
                    },
                    ...options.flags,
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
                CustonMixins.methods.logNetworkError(error)
                // return error // < would this be needed maybe?
            })
    }

    static customSupabaseApiFetchById(options = { flags: {}, moreHeaders: {}, rels: [] }, url, id, relationships = []) {
        relationships
        return this.customApiBase(options.moreHeaders)
            .get(url, {
                // params: {
                //     with: relationships,
                // },
                dataTransformer: ({ data }) => {
                    const result = CustonMixins.methods.NormalizeRecursive(data)
                    return result
                },
            })
            .then((res) => {
                return res
            })
            .catch((error) => {
                CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiStore(url, entity, options = { flags: {}, moreHeaders: {}, rels: [] }) {
        return this.customApiBase(options.moreHeaders)
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
                CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiUpsert(url, entity, options = { flags: {}, moreHeaders: {}, rels: [] }) {
        return this.customApiBase(options.moreHeaders)
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
                CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiUpdate(url, entity, options = { flags: {}, moreHeaders: {}, rels: [] }) {
        return this.customApiBase(options.moreHeaders)
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
                CustonMixins.methods.logNetworkError(error)
            })
    }

    static customSupabaseApiDelete(url, entityId, options = { flags: {}, moreHeaders: {}, rels: [] }) {
        return this.customApiBase(options.moreHeaders)
            .delete(url, {
                delete: entityId,
            })
            .then((res) => {
                CustonMixins.methods.logNetworkSuccess(res)
                return res
            })
            .catch((error) => {
                CustonMixins.methods.logNetworkError(error)
            })
    }
}
