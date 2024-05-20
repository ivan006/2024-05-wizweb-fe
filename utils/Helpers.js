import CustonMixins from '@/2024-05-vue-orm-ui/mixins/CustonMixins'
import { createClient } from '@supabase/supabase-js'

class Helpers {

    static snakeToTitle(string) {
        return string
            .split('_')
            .map(
                (part) =>
                    part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join(' ')
    }

    static getIfMatchesAllChecks(item, filters) {
        for (const [key, filter] of Object.entries(filters)) {
            // todo: note the below logic was to support time range filters
            if (
                typeof filter === 'object' &&
                !Array.isArray(filter) &&
                filter !== null
            ) {
                if (filter?.value) {
                    if (filter.usageType === 'timeRangeStart') {
                        if (filter.value.range.start) {
                            const startDate = new Date(filter.value.range.start)
                            const endDate = new Date(filter.value.range.end)
                            const itemDate = new Date(item[key])
                            return startDate < itemDate && itemDate < endDate
                        }
                    }
                }
            } else if (filter !== null) {
                return item[key] == filter
            }
        }

        return true
    }

    static prepareFiltersForAxios(obj) {
        let result = []
        for (const [key, filter] of Object.entries(obj)) {
            // todo: note the below logic was to support time range filters
            if (
                typeof filter === 'object' &&
                !Array.isArray(filter) &&
                filter !== null
            ) {
                if (filter?.value) {
                    if (filter.usageType === 'timeRangeStart') {
                        if (filter.value.range.start) {
                            result.push(
                                `${key}=gte.${filter.value.range.start}`
                            )
                            result.push(`${key}=lte.${filter.value.range.end}`)
                        }
                    }
                }
            } else if (filter !== null) {
                // result[key] = `eq.${item.value}`;
                result.push(`${key}=eq.${filter}`)
            }
        }
        // return result;
        return result.join('&')
    }

    static prepareRelationsForAxios(arr) {
        let select = ['*']
        for (const value of arr) {
            select.push(`${value}(*)`)
        }

        // *,event_type_id(*),provider_that_owns_this_id(*),event_type:venue_country_id(*),venue_state_id(*),venue_substate_id(*),venue_town_id(*),venue_suburb_id(*)
        const result = select.join(',')

        return {
            select: result,
        }
    }

    static getSupabaseClient() {
        const baseUrlAndHeaders =
            CustonMixins.methods.DefaultHeadersAndBaseUrl()
        const result = createClient(
            baseUrlAndHeaders.baseURL,
            baseUrlAndHeaders.headers.AuthToken,
            {
                headers: { ...baseUrlAndHeaders.headers },
            }
        )
        return result
    }

    static capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

}

export default Helpers
