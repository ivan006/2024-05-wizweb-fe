<template>
    <div>
        <v-tooltip bottom :disabled="canCreatePart2">
            <template v-slot:activator="{ props }">
                <div v-bind="props">
                    <v-btn
                        @click="
                            (e) => {
                                $emit('createItem', e)
                            }
                        "
                        :disabled="!canCreatePart2"
                        >Create</v-btn
                    >
                </div>
            </template>
            <span>{{ canCreateMsg }}</span>
        </v-tooltip>
    </div>
</template>

<script>
import LoginSession from '@/models/LoginSession'
import DBProviderGroup from '@/models/DBProviderGroup'

export default {
    name: 'CreateButton',
    props: {
        modelFields: {
            type: Array,
            default() {
                return []
            },
        },
        currentParentRecord: {
            type: Object,
            default() {
                return null
            },
        },
        model: {
            type: [Object, Function],
            default() {
                return null
            },
        },
    },
    computed: {
        loginSession() {
            return LoginSession.query().withAllRecursive().first()
        },
        relationshipsOfProvider() {
            const result = DBProviderGroup.query()
                .whereId(+this.currentParentRecord.item.id)
                .with('memberships.customer')
                .first()
            return result
        },
        recordsNeedsCustomerOwner() {
            const result = this.modelFields.find((field) => {
                return field.usageType == 'relForeignKeyOwnerCustomerType'
            })
            return result
        },
        recordsNeedsProviderOwner() {
            const result = this.modelFields.find((field) => {
                return [
                    'relForeignKeyOwnerApprovedByProviderType',
                    'relForeignKeyOwnerProviderType',
                ].includes(field.usageType)
            })
            return result
        },

        canCreate() {
            let result = false
            if (this.currentParentRecord) {
                result = true

                if (this.currentParentRecord.model.name == 'DBProviderGroup') {
                    if (this.recordsNeedsProviderOwner) {
                        const currentProviderGroupMatchesAssociated =
                            this.providerGroupsAssociatedWithUser.find(
                                (group) => {
                                    return (
                                        +group.id == +this.currentParentRecord.item.id
                                    )
                                }
                            )
                        result = !!currentProviderGroupMatchesAssociated

                        if (this.recordsNeedsCustomerOwner) {
                            const customerCheck =
                                this.relationshipsOfProvider.memberships.find(
                                    (relationship) => {
                                        return this.customerGroupsAssociatedWithUser.find(
                                            (group) => {
                                                return (
                                                    +group.id ==
                                                    +relationship.customer.id
                                                )
                                            }
                                        )
                                    }
                                )
                            result = !!customerCheck || result
                        }
                    }
                } else if (this.currentParentRecord.model.name == 'DBCustomerGroup') {
                    if (this.recordsNeedsCustomerOwner) {
                        const currentCustomerGroupMatchesAssociated =
                            this.customerGroupsAssociatedWithUser.find(
                                (group) => {
                                    return (
                                        +group.id == +this.currentParentRecord.item.id
                                    )
                                }
                            )
                        result = !!currentCustomerGroupMatchesAssociated
                    }
                }
            }
            // else if (
            //     ['DBCustomerGroup', 'DBProviderGroup'].includes(this.model.name)
            // ) {
            //     result = true
            // }
            else {
                result = true
            }
            return result
        },
        canCreateMsgType() {
            let result = ''
            if (this.currentParentRecord) {
                if (this.currentParentRecord.model.name == 'DBProviderGroup') {
                    result = 'provider'
                } else if (this.currentParentRecord.model.name == 'DBCustomerGroup') {
                    result = 'customer'
                }
            }
            return result
        },
        canCreatePart2() {
            let result = this.canCreate
            if (
                this.currentParentRecord &&
                this.currentParentRecord.relationType ==
                    'relChildrenChildrenApplicationType'
            ) {
                // result =
                //     this.canCreate ||
                //     !!this.loginSession?.enabled_customer_group_id

                result =
                    this.canCreate ||
                    !!this.customerGroupsAssociatedWithUser.length
            }
            return result
        },
        canCreateMsg() {
            let result = this.getMsg(this.canCreateMsgType)
            if (
                this.currentParentRecord &&
                this.currentParentRecord.relationType ==
                    'relChildrenChildrenApplicationType'
            ) {
                result = this.getMsg('customer')
            }
            return result
        },
    },
    methods: {
        getProviderWithRelationships() {
            DBProviderGroup.FetchAll({
                page: 1,
                limit: 100,
                filters: {
                    id: +this.currentParentRecord.item.id,
                },
                flags: {},
                moreHeaders: {},
                clearPrimaryModelOnly: false,
                relationships: [
                    'memberships!memberships_approved_by_id_fkey(*,customer:customer_id(*))',
                ],
            }).then(() => {})
        },
        getMsg(type) {
            let result = ''
            if (Array.isArray(type)) {
                if (type.length > 1) {
                    result = `To create first set your active ${type[0]} group and  active ${type[1]}  group`
                }
            } else {
                result = `To create first set your active ${type} group`
            }
            return result
        },
    },
    mounted() {
        if (this.recordsNeedsProviderOwner && this.recordsNeedsCustomerOwner) {
            this.getProviderWithRelationships()
        }
    },
}
</script>

<style scoped></style>
