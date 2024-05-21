// import router from '@/router'
import VueCookies from 'vue-cookies'
import moment from 'moment/moment'
import SnackbarNotification from '../models/SnackbarNotification'
import LoginSession from '../models/LoginSession'
import DBProviderGroup from '../models/DBProviderGroup'
import Helpers from 'src/utils/Helpers'
import DBMembership from '../models/DBMembership'
import DBCustomerManager from '../models/DBCustomerManager'
import DBCustomerGroup from '../models/DBCustomerGroup'

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
        logNetworkError(error) {
            // Handling Axios error
            if (error.response) {
                // The request was made and the server responded with a status code that falls out of the range of 2xx
                let errorMessage = 'Unknown error' // Default

                if (error.response.status === 404) {
                    errorMessage = 'The requested resource was not found.'
                } else if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data
                } else if (error.response.data) {
                    errorMessage =
                        error.response.data.msg ||
                        error.response.data.message ||
                        errorMessage

                    // Support for "error" and "error_description" fields
                    if (
                        error.response.data.error &&
                        error.response.data.error_description
                    ) {
                        errorMessage = `${error.response.data.error}: ${error.response.data.error_description}`
                    }
                }

                SnackbarNotification.insert({
                    data: {
                        id: Date.now(),
                        text: 'Server responded with error: ' + errorMessage,
                        date: moment().toISOString(),
                        show: true,
                    },
                })

                if (
                    error.response.data.message &&
                    error.response.data.message == 'JWT expired'
                ) {
                    SnackbarNotification.insert({
                        data: {
                            id: Date.now(),
                            text: 'Your login LoginSession unexpectedly expired.',
                            date: moment().toISOString(),
                            show: true,
                        },
                    })
                    VueCookies.remove('VITE_AUTH')
                    LoginSession.deleteAll()
                }
            } else if (error.request) {
                // The request was made but no response was received
                SnackbarNotification.insert({
                    data: {
                        id: Date.now(),
                        text: 'No response received from server.',
                        date: moment().toISOString(),
                        show: true,
                    },
                })
            } else {
                // Something happened in setting up the request that triggered an error
                SnackbarNotification.insert({
                    data: {
                        id: Date.now(),
                        text: 'Error in request setup: ' + error.message,
                        date: moment().toISOString(),
                        show: true,
                    },
                })
            }

            // Propagate the error upwards, so any calling function knows an error occurred.
            throw error
        },
        logNetworkSuccess(response) {
            if (
                response?.config?.method &&
                response?.model?.entity
                // response?.entities &&
                // Object.keys(response.entities).length > 0
            ) {
                let message = ''

                // const entityType = Object.keys(response.entities)[
                //     Object.keys(response.entities).length - 1
                // ]
                const entityType = response?.model?.entity
                if (response.config.method.toLowerCase() !== 'get') {
                    const entityTypeSingular = this.toSingular(entityType)
                    switch (response.config.method.toLowerCase()) {
                        // case 'get':
                        //     message += `Retrieved ${entityType} successfully.`
                        //     break

                        case 'post':
                            message += `Created ${entityTypeSingular} successfully.`
                            break

                        case 'put':
                            message += `Updated ${entityTypeSingular} successfully.`
                            break

                        case 'delete':
                            message += `Deleted ${entityTypeSingular} successfully.`
                            break

                        default:
                            message +=
                                response.status + ' ' + response.statusText
                            break
                    }

                    SnackbarNotification.insert({
                        data: {
                            id: Date.now(),
                            text: message,
                            date: moment().toISOString(),
                            show: true,
                        },
                    })
                }
            }
        },
        toSingular(word) {
            if (word.endsWith('ies')) {
                return word.slice(0, -3) + 'y'
            } else if (word.endsWith('s')) {
                return word.slice(0, -1)
            }
            return word
        },
    },
    computed: {
        loginSession() {
            return LoginSession.query().withAllRecursive().first()
        },

        ownerFilters() {
            let result = {}
            if (this.loginSession?.user?.person?.[0]?.id) {
                result.person_that_created_this_id =
                    this.loginSession.user.person[0].id
            }
            return result
        },
        providerGroupsTheyOwn() {
            let result = []
            if (this.loginSession) {
                result = DBProviderGroup.query()
                    .where((item) => {
                        return Helpers.getIfMatchesAllChecks(
                            item,
                            this.ownerFilters
                        )
                    })
                    .withAll()
                    .orderBy('id', 'desc')
                    .get()
            }
            return result
        },
        managerFilters() {
            let result = {}
            if (this.loginSession?.user?.person?.[0]?.id) {
                result.member_id = this.loginSession.user.person[0].id
            }
            return result
        },

        providerGroupByProxyForManagers() {
            let result = []
            DBMembership.query().get()
            // console.log('ssssssss')

            if (this.loginSession) {
                const customersWithEtc = DBCustomerManager.query()
                    .where((item) => {
                        return Helpers.getIfMatchesAllChecks(
                            item,
                            this.managerFilters
                        )
                    })
                    // .with(
                    //     'customer_that_owns_this.relationships.provider_group'
                    // )
                    .withAllRecursive()
                    .orderBy('id', 'desc')
                    .get()

                // Extract provider groups from customersWithEtc
                customersWithEtc.forEach((cm) => {
                    if (
                        cm.customer_that_owns_this &&
                        cm.customer_that_owns_this.memberships
                    ) {
                        cm.customer_that_owns_this.memberships.forEach(
                            (cpl) => {
                                // const rel = DBMembership.query()
                                //     .whereId(cpl.id)
                                //     .first()
                                // if (rel.provider_group) {
                                //     result.push(rel.provider_group)
                                // }

                                if (cpl.provider_group) {
                                    result.push(cpl.provider_group)
                                }
                            }
                        )
                    }
                })
            }
            return result
        },
        providerGroupsAssociatedWithUser() {
            let result = this.providerGroupsTheyOwn
            for (const provider of this.providerGroupByProxyForManagers) {
                const check = result.filter((item) => {
                    return item.id == provider.id
                })
                if (!check.length) {
                    result.push(provider)
                }
            }
            for (const provider of this.providerGroupByProxyForOwners) {
                const check = result.filter((item) => {
                    return item.id == provider.id
                })
                if (!check.length) {
                    result.push(provider)
                }
            }
            return result
        },

        providerGroupByProxyForOwners() {
            let result = []
            if (this.loginSession) {
                // Extract provider groups from customersWithEtc
                this.customerGroupsForOwners.forEach((cm) => {
                    if (cm.memberships) {
                        cm.memberships.forEach((cpl) => {
                            if (cpl.approved_by) {
                                result.push(cpl.approved_by)
                            }
                        })
                    }
                })
            }
            return result
        },

        customerGroupsForOwners() {
            let result = []
            if (this.loginSession) {
                result = DBCustomerGroup.query()
                    .where((item) => {
                        return Helpers.getIfMatchesAllChecks(
                            item,
                            this.ownerFilters
                        )
                    })
                    .with('memberships.approved_by')
                    .orderBy('id', 'desc')
                    .get()
            }
            return result
        },

        customersGroupsForManagers() {
            let result = []
            if (this.loginSession) {
                const customerManager = DBCustomerManager.query()
                    .where((item) => {
                        return Helpers.getIfMatchesAllChecks(
                            item,
                            this.managerFilters
                        )
                    })
                    .withAll()
                    .orderBy('id', 'desc')
                    .get()

                customerManager.forEach((cm) => {
                    if (cm.customer_that_owns_this) {
                        result.push(cm.customer_that_owns_this)
                    }
                })
            }

            return result
        },


        customerGroupsAssociatedWithUser() {
            let result = this.customerGroupsForOwners
            for (const group of this.customersGroupsForManagers) {
                const check = this.customerGroupsForOwners.filter((item) => {
                    return item.id == group.id
                })
                if (!check.length) {
                    result.push(group)
                }
            }
            return result
        },
    },
}
