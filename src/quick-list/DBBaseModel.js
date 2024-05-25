// src/models/BaseModel.js
import axios from 'axios';
import CustonMixins from '../mixins/CustonMixins';
import Helpers from '../utils/Helpers';

class BaseModel {

    static primaryKey = 'id';

    static fields() {
        return {};
    }

    static attr(required = false, value = null) {
        return { type: 'attr', default: value, required };
    }

    static hasOne(related, foreignKey, localKey = this.primaryKey) {
        return { type: 'hasOne', related, foreignKey, localKey };
    }

    static belongsTo(parent, foreignKey, ownerKey = this.primaryKey) {
        return { type: 'belongsTo', parent, foreignKey, ownerKey };
    }

    static hasMany(related, foreignKey, localKey = this.primaryKey) {
        return { type: 'hasMany', related, foreignKey, localKey };
    }

    // static belongsToMany(related, pivotTable, foreignKey, localKey = this.primaryKey) {
    //     return { type: 'belongsToMany', related, pivotTable, foreignKey, localKey };
    // }

    static customApiBase(moreHeaders) {
        const baseUrlAndHeaders = CustonMixins.methods.DefaultHeadersAndBaseUrl();
        this.apiConfig = {
            baseURL: '',
            headers: {
                ...baseUrlAndHeaders.headers,
                ...moreHeaders,
            },
        };
        return axios.create(this.apiConfig);
    }

    static async customSupabaseApiFetchAll(url, relationships = [], options = {}) {
        const {
            page = 1,
            limit = 15,
            filters = {},
            flags = {},
            moreHeaders = {},
            clearPrimaryModelOnly = false,
        } = options;

        const offset = (page - 1) * limit;

        try {
            const response = await this.customApiBase(moreHeaders).get(
                `${url}?${Helpers.prepareFiltersForAxios(filters)}`,
                {
                    params: {
                        limit,
                        offset,
                        ...flags,
                        ...Helpers.prepareRelationsForAxios(relationships),
                    },
                }
            );

            if (clearPrimaryModelOnly) {
                this.deleteAll();
            }

            return response;
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customSupabaseApiFetchById(options = {}, url, id, relationships = []) {
        const { flags = {}, moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).get(url, {
                params: {
                    ...flags,
                    ...Helpers.prepareRelationsForAxios(relationships),
                },
            });

            return response;
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customSupabaseApiStore(url, entity, options = {}) {
        const { moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).post(url, entity);
            CustonMixins.methods.logNetworkSuccess(response);
            return response;
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customSupabaseApiUpsert(url, entity, options = {}) {
        const { moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).post(url, entity);
            CustonMixins.methods.logNetworkSuccess(response);
            return response;
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customSupabaseApiUpdate(url, entity, options = {}) {
        const { moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).patch(url, entity);
            CustonMixins.methods.logNetworkSuccess(response);
            return response;
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customSupabaseApiDelete(url, entityId, options = {}) {
        const { moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).delete(url, {
                data: { id: entityId },
            });
            CustonMixins.methods.logNetworkSuccess(response);
            return response.data;
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }
}

export default BaseModel;
