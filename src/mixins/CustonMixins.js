// import router from '@/router'
import VueCookies from 'vue-cookies'
import moment from 'moment'
// import SnackbarNotification from '../models/SnackbarNotification'
// import LoginSession from '../models/LoginSession'
// import DBProviderGroup from '../models/DBProviderGroup'
// import Helpers from 'src/utils/Helpers'
// import DBMembership from '../models/DBMembership'
// import DBCustomerManager from '../models/DBCustomerManager'
// import DBCustomerGroup from '../models/DBCustomerGroup'

export default {
    methods: {
        NormalizeRecursive(value) {
            const result = this.NormalizeRecursiveChild(
                value,
                null,
                'attributes',
                'data'
            )
            return result
        },
        NormalizeRecursiveChild(
            value,
            parent,
            propertyGroupNameToFlatten,
            elementGroupNameToFlatten
        ) {
            let result = value
            if (
                typeof value === 'object' &&
                !Array.isArray(value) &&
                value !== null
            ) {
                //Chatgpts logic start
                // New logic: Rename keys ending in '_id'
                // Object.keys(value).forEach((key) => {
                //     if (key.endsWith('_id') && typeof value[key] == "object" && value[key] !== null) {
                //         const newKey = key.slice(0, -3) // Removing "_id"
                //         value[newKey] = value[key]
                //         delete value[key]
                //     }
                // })

                //Chatgpts logic end

                if (value[elementGroupNameToFlatten] !== undefined) {
                    const valueToFlatten = value[elementGroupNameToFlatten]
                    result = this.NormalizeRecursiveChild(
                        valueToFlatten,
                        value,
                        propertyGroupNameToFlatten,
                        elementGroupNameToFlatten
                    )
                } else {
                    let flattened = value
                    if (value[propertyGroupNameToFlatten] !== undefined) {
                        const valueToFlatten = value[propertyGroupNameToFlatten]
                        flattened = { ...value, ...valueToFlatten }
                    }
                    result = {}
                    Object.keys(flattened).map((key) => {
                        if (key !== propertyGroupNameToFlatten) {
                            result[key] = this.NormalizeRecursiveChild(
                                flattened[key],
                                value,
                                propertyGroupNameToFlatten,
                                elementGroupNameToFlatten
                            )
                        }
                    })
                }
            } else if (Array.isArray(value)) {
                result = []
                value.map((value2, key) => {
                    result[key] = this.NormalizeRecursiveChild(
                        value2,
                        value,
                        propertyGroupNameToFlatten,
                        elementGroupNameToFlatten
                    )
                })
            }
            return result
        },

        // goto(path) {
        //     router.push(path)
        // },
        VITE_API_URL() {
            return import.meta.env.VITE_API_URL
        },
        DefaultHeaders() {
            // const SUPABASE_ANON_KEY =
            //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGtlbHB2enJqendyc3N0eGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg5MTU1NzEsImV4cCI6MjAwNDQ5MTU3MX0.nV9IYVjXM0rlh_rYXIcJN8R3UE5_Lopw5hczNlZmMwQ'
            // const SUPABASE_ANON_KEY = import.meta.env.VITE_ANON_KEY
            let defaultHeaders = {
                // 'X-Requested-With': 'XMLHttpRequest',
                // Accept: 'application/json',
                // Apikey: import.meta.env.VITE_ANON_KEY,
                'Content-Type': 'application/json',
            }
            const VITE_AUTH = VueCookies.get('VITE_AUTH')
            if (VITE_AUTH) {
                defaultHeaders['Authorization'] =
                    'Bearer ' + VITE_AUTH.access_token
                defaultHeaders['AuthToken'] = VITE_AUTH.access_token
            }
            defaultHeaders['prefer'] =
                'resolution=merge-duplicates,return=representation'
            // defaultHeaders['prefer'] =
            //     'return=representation'
            return defaultHeaders
        },
        DefaultHeadersAndBaseUrl() {
            // const SUPABASE_URL = 'https://volkelpvzrjzwrsstxjh.supabase.co'
            const SUPABASE_URL = ""
            const result = {
                baseURL: SUPABASE_URL,
                headers: {
                    ...this.DefaultHeaders(),
                },
            }
            return result
        },
        getHumanReadableDate(theMoment) {
            let value = null
            const updateMoment = moment(new Date(theMoment))
            const currMoment = moment()
            const diff = moment.duration(updateMoment.diff(currMoment))
            if (diff.asWeeks() > -1) {
                value = updateMoment.fromNow()
            } else {
                value = updateMoment.format('llll')
            }
            value = value.charAt(0).toUpperCase() + value.slice(1)
            return value
        },
    },
}
