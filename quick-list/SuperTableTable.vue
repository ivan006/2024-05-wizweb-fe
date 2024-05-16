<template>
    <div>
        <v-data-table
            :mobile-breakpoint="0"
            @click:row="clickRow"
            :headers="flattenedHeadersHideMapField"
            :items="items"
            :page="paginatedGetSet.page"
            sort-desc
            :items-per-page="paginatedGetSet.itemsPerPage"
            :server-items-length="+pagination.totalItems"
            @update:options="updateOptions"
            :sort-by="['id']"
        >
            <template
                v-for="(header, index) in flattenedHeaders"
                v-slot:[`item.${header.value}`]="{ item }"
                :key="index"
            >
                <template v-if="header.isChildOf">
                    <div>
                        <FormattedColumn
                            :isTag="true"
                            :header="header"
                            :modelFields="modelFields"
                            :item="item[header.isChildOf.value]"
                            @deleteItem="deleteItem"
                            @editItem="editItem"
                            :displayMapField="displayMapField"
                            :model="model"
                            :canEdit="canEdit"
                            :currentParentRecord="currentParentRecord"
                        />
                    </div>
                </template>
                <template v-else>
                    <div>
                        <FormattedColumn
                            :header="header"
                            :modelFields="modelFields"
                            :item="item"
                            @deleteItem="deleteItem"
                            @editItem="editItem"
                            :displayMapField="displayMapField"
                            :model="model"
                            :canEdit="canEdit"
                            :currentParentRecord="currentParentRecord"
                        />
                    </div>
                </template>
            </template>
        </v-data-table>
    </div>
</template>

<script>
import FormattedColumn from '@/2024-05-vue-orm-ui/quick-list/FormattedColumn.vue'

export default {
    name: 'SuperTableTable',
    components: { FormattedColumn },

    props: {
        headers: {
            type: Array,
            default() {
                return []
            },
        },
        items: {
            type: Array,
            default() {
                return []
            },
        },
        pagination: {
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
    computed: {
        paginatedGetSet: {
            get() {
                return this.pagination
            },
            set(value) {
                this.$emit('updatePagination', value)
            },
        },
        flattenedHeaders() {
            let result = []
            for (const header of this.headers) {
                result.push(header)
                if (header.headerChildren) {
                    for (const childHeader of header.headerChildren) {
                        result.push({
                            // isChildOf: header,
                            ...childHeader,
                        })
                    }
                }
            }
            return result
        },
        flattenedHeadersHideMapField() {
            let result = []
            for (const header of this.flattenedHeaders) {
                if (!this.displayMapField) {
                    if (
                        !header.usageType.startsWith('relLookupMapExtra') &&
                        !header.usageType.startsWith('mapExtra')
                    ) {
                        result.push(header)
                    }
                } else {
                  result.push(header)
                }
            }
            return result
        },
    },
    methods: {
        updateOptions(e) {
            this.$emit('updateOptions', e)
        },
        deleteItem(e) {
            this.$emit('deleteItem', e)
        },
        editItem(e) {
            this.$emit('editItem', e)
        },
        clickRow(e, row) {
            this.$emit('clickRow', row.item)
        },
    },
    watch: {
        'editItemData.showModal'(arg) {
            if (!arg) {
                this.editItemData.data = {}
            }
        },
    },
}
</script>

<style scoped></style>
