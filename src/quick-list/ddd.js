// src/models/BaseModel.js
import axios from 'axios';
import CustonMixins from '../mixins/CustonMixins';
import Helpers from '../utils/Helpers';

class BaseModel {
    constructor(record = {}) {
        this.$fill(record);
    }

    $fill(record) {
        const fields = this.constructor.fields();
        for (const field in fields) {
            this[field] = record[field] !== undefined ? record[field] : fields[field].default;
        }
    }

    static get localKey() {
        return 'id';
    }

    static fields() {
        return {};
    }

    static attr(value = null) {
        return { type: 'attr', default: value };
    }

    static string(value = '') {
        return { type: 'string', default: value };
    }

    static number(value = 0) {
        return { type: 'number', default: value };
    }

    static boolean(value = false) {
        return { type: 'boolean', default: value };
    }

    static uid(value = null) {
        return { type: 'uid', default: value };
    }

    static hasOne(related, foreignKey, localKey = this.localKey) {
        return { type: 'hasOne', related, foreignKey, localKey };
    }

    static belongsTo(parent, foreignKey, ownerKey = this.localKey) {
        return { type: 'belongsTo', parent, foreignKey, ownerKey };
    }

    static hasMany(related, foreignKey, localKey = this.localKey) {
        return { type: 'hasMany', related, foreignKey, localKey };
    }

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

    static async customApiFetchAll(url, relationships = [], options = {}) {
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

            return CustonMixins.methods.NormalizeRecursive(response.data);
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customApiFetchById(url, id, relationships = [], options = {}) {
        const { flags = {}, moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).get(`${url}/${id}`, {
                params: {
                    ...flags,
                    ...Helpers.prepareRelationsForAxios(relationships),
                },
            });

            return CustonMixins.methods.NormalizeRecursive(response.data);
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customApiStore(url, entity, options = {}) {
        const { moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).post(url, entity);
            CustonMixins.methods.logNetworkSuccess(response);
            return CustonMixins.methods.NormalizeRecursive(response.data);
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customApiUpsert(url, entity, options = {}) {
        const { moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).post(url, entity);
            CustonMixins.methods.logNetworkSuccess(response);
            return CustonMixins.methods.NormalizeRecursive(response.data);
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customApiUpdate(url, entity, options = {}) {
        const { moreHeaders = {} } = options;

        try {
            const response = await this.customApiBase(moreHeaders).patch(url, entity);
            CustonMixins.methods.logNetworkSuccess(response);
            return CustonMixins.methods.NormalizeRecursive(response.data);
        } catch (error) {
            CustonMixins.methods.logNetworkError(error);
            throw error;
        }
    }

    static async customApiDelete(url, entityId, options = {}) {
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
