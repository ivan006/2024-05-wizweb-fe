<template>
    <div>
        <template v-if="header.usageType.startsWith('relChildren')"> </template>
        <template
            v-else-if="
                header.usageType == 'readOnlyTimestampType' ||
                header.usageType == 'timestampType' ||
                header.usageType == 'timeRangeStart' ||
                header.usageType == 'timeRangeEnd'
            "
        >
            {{ formatTimestamp(item[header.value]) }}
        </template>
        <template v-else-if="header.usageType == 'actions'">
            <v-btn
              @click.stop="editItem(item)"
              :disabled="disabled()"
              color="grey"
              icon="mdi-pencil"
              variant="plain"
              height="36px"
              width="36px"
            />
            <v-btn
              @click.stop="deleteItem(item)"
              :disabled="disabled()"
              color="grey"
              icon="mdi-delete"
              variant="plain"
              height="36px"
              width="36px"
            />
            <template v-if="canEdit">
                <v-dialog v-model="editItemData.showModal" max-width="800px" scrollable>
                    <CreateEditForm
                        title="Edit Item"
                        v-if="editItemData.showModal"
                        :modelFields="modelFields"
                        v-model="editItemData.data"
                        :model="model"
                        :displayMapField="displayMapField"
                        @submit="editItemSubmit"
                        @cancel="editItemData.showModal = false"
                        :currentParentRecord="currentParentRecord"
                    />
                </v-dialog>

                <v-dialog v-model="deleteItemData.showModal" max-width="600px">
                    <v-card>
                        <v-card-title> Delete Item </v-card-title>
                        <v-card-text> Delete item? </v-card-text>

                        <v-card-actions>
                            <v-btn @click="deleteItemData.showModal = false"
                                >Cancel</v-btn
                            >
                            <v-btn @click="deleteItemSubmit">Delete</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </template>
        </template>
        <template v-else-if="header.usageType.startsWith('relLookup')">
            <div style="min-height: 32px">
                <!--                {{header.value}}-->
                <!--                <pre>{{item}}</pre>-->
                <v-chip
                    v-if="
                        item?.[header.value]?.[header.meta.lookupDisplayField]
                    "
                >
                    {{ item?.[header.value]?.[header.meta.lookupDisplayField] }}
                </v-chip>
            </div>
        </template>
        <template v-else>
            <template v-if="isTag">
                <v-chip v-if="isTag">
                    {{ item[header.value] }}
                </v-chip>
            </template>
            <template v-else>
                {{ item[header.value] }}
            </template>
        </template>
    </div>
</template>

<script>
import moment from 'moment-timezone'
import LoginSession from '@/models/LoginSession'
import QuickListsHelpers from '@/views/global/quick-list/QuickListsHelpers'
import CreateEditForm from '@/views/global/quick-list/CreateEditForm.vue'

export default {
    name: 'FormattedColumn',
    components: { CreateEditForm },
    props: {
        isTag: {
            type: Boolean,
            default() {
                return false
            },
        },
        header: {
            type: Object,
            default() {
                return {}
            },
        },
        item: {
            type: Object,
            default() {
                return {}
            },
        },
        displayMapField: {
            type: Boolean,
            default() {
                return false
            },
        },
        modelFields: {
            type: Array,
            default() {
                return []
            },
        },
        model: {
            type: [Object, Function],
            required: true,
        },
        canEdit: {
            type: Boolean,
            default() {
                return false
            },
        },
        currentParentRecord: {
            type: Object,
            default() {
                return null
            },
        },
    },
    data() {
        return {
            deleteItemData: {
                showModal: false,
                data: null,
            },
            editItemData: {
                showModal: false,
                data: null,
            },
        }
    },
    computed: {
        // treatAsRealation() {
        //     let result = ['relationship']
        //     if (this.displayMapField) {
        //         result.push('mapRelation')
        //     }
        //     return result
        // },
        loginSession() {
            return LoginSession.query().withAllRecursive().first()
        },
        filters() {
            let result = {}
            if (this.loginSession?.user?.person?.[0]?.id) {
                result.person_that_created_this_id =
                    this.loginSession.user.person[0].id
            }
            return result
        },
    },

    methods: {
        disabled() {
            // console.log('123')
            // console.log(this.hasGroupBeingAppliedToEditPermissions())
            // console.log(this.hasProviderGroupOwnerEditPermissions())
            // console.log(this.hasRecordOwnerEditPermissions())
            // console.log(this.hasCustomerGroupOwnerEditPermissions())
            const result =
                !this.hasGroupBeingAppliedToEditPermissions() &&
                !this.hasProviderGroupOwnerEditPermissions() &&
                !this.hasRecordOwnerEditPermissions() &&
                !this.hasCustomerGroupOwnerEditPermissions()
            return result
        },
        hasCustomerGroupOwnerEditPermissions() {
            let result = false
            if (this.loginSession) {
                const providerKey = this.modelFields.find((field) => {
                    return field.usageType == 'relForeignKeyOwnerCustomerType'
                })
                if (providerKey) {
                    result = [this.customerGroupsForOwners].includes(
                        this.item[providerKey.name]
                    )

                    const theirGroupThatOwnsRecord =
                        this.customerGroupsForOwners.find((item) => {
                            return item.id == this.item[providerKey.name]
                        })
                    result = !!theirGroupThatOwnsRecord
                }
            }
            return result
        },
        hasProviderGroupOwnerEditPermissions() {
            let result = false
            if (this.loginSession) {
                const providerKey = this.modelFields.find((field) => {
                    return field.usageType == 'relForeignKeyOwnerProviderType'
                })
                if (providerKey) {
                    result = [this.providerGroupsTheyOwn].includes(
                        this.item[providerKey.name]
                    )

                    const theirGroupThatOwnsRecord =
                        this.providerGroupsTheyOwn.find((item) => {
                            return item.id == this.item[providerKey.name]
                        })
                    result = !!theirGroupThatOwnsRecord
                }
            }
            return result
        },
        hasGroupBeingAppliedToEditPermissions() {
            // relForeignKeyOwnerCustomerType
            let result = false
            if (this.loginSession) {
                const providerKey = this.modelFields.find((field) => {
                    return (
                        field.usageType ==
                        'relForeignKeyOwnerAppliedToProviderType'
                    )
                })
                if (providerKey) {
                    result = this.providerGroupsTheyOwn.includes(
                        this.item[providerKey.name]
                    )

                    const theirGroupThatOwnsRecord =
                        this.providerGroupsTheyOwn.find((item) => {
                            return item.id == this.item[providerKey.name]
                        })
                    result = !!theirGroupThatOwnsRecord
                }
            }
            return result
        },
        hasRecordOwnerEditPermissions() {
            let result = false
            if (this.loginSession) {
                const creatorKey = this.modelFields.find((field) => {
                    return field.usageType == 'relForeignKeyCreatorType'
                })
                if (creatorKey) {
                    if (this.loginSession?.user?.person?.[0]?.id) {
                        result =
                            this.loginSession.user.person[0].id ==
                            this.item[creatorKey.name]
                    }
                }
            }
            return result
        },
        // deleteItem(input) {
        //     this.$emit('deleteItem', input)
        // },
        // editItem(input) {
        //     this.$emit('editItem', input)
        // },

        deleteItem(item) {
            this.deleteItemData.data = item
            this.deleteItemData.showModal = true
        },
        deleteItemSubmit() {
            this.model.Delete(this.deleteItemData.data.id).then(() => {
                // Remove item from items array or refetch data
                this.fetchData()
            })
            this.deleteItemData.showModal = false
        },
        editItem(item) {
            this.editItemData.data = { ...item }
            this.editItemData.showModal = true
        },
        editItemSubmit() {
            const payload = QuickListsHelpers.preparePayload(
                this.editItemData.data,
                this.modelFields
            )
            this.model.Update(payload).then(() => {
                this.fetchData()
            })
            this.editItemData.showModal = false
        },
        formatTimestamp(timestamp) {
            if (timestamp) {
                const timezone = 'Africa/Johannesburg' // replace with desired timezone
                const formattedDateInTimeZone = moment
                    .tz(timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ', 'UTC')
                    .tz(timezone)
                    .format('dddd, MMMM D, YYYY h:mm A')
                return formattedDateInTimeZone
            } else {
                return null
            }
        },
    },
}
</script>

<style scoped></style>
