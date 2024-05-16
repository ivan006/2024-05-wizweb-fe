<template>
    <div>
        <v-row class="fill-height ma-n2" justify="center">
            <template v-for="item of items" :key="item.name">
                <v-col cols="12" md="3" class="pa-2">
                    <v-card class="mx-auto" style="height: 100%;">
                        <template v-if="model.displayMapSummary && model.displayMapSummary.rows">
                            <RecordOverviewDynamic
                                :headers="headers"
                                :item="item"
                                @deleteItem="deleteItem"
                                @editItem="editItem"
                                @clickRow="clickRow"
                                :clickable="true"
                                :maxFields="6"
                                :displayMapField="displayMapField"
                                :model="model"
                                :canEdit="canEdit"
                                :currentParentRecord="currentParentRecord"
                                :childRelations="[]"
                                isSummary
                            />
                        </template>
                        <template v-else>
                            <RecordOverview
                                :headers="headers"
                                :item="item"
                                @deleteItem="deleteItem"
                                @editItem="editItem"
                                @clickRow="clickRow"
                                :clickable="true"
                                :maxFields="6"
                                :displayMapField="displayMapField"
                                :model="model"
                                :canEdit="canEdit"
                                :currentParentRecord="currentParentRecord"
                            />
                        </template>
                    </v-card>
                </v-col>
            </template>
        </v-row>
        <template v-if="!items.length">
            <div style="text-align: center">No data available</div>
        </template>
    </div>
</template>

<script>
import RecordOverview from '@/2024-05-vue-orm-ui/quick-list/RecordOverview.vue'
import RecordOverviewDynamic from '@/2024-05-vue-orm-ui/quick-list/RecordOverviewDynamic.vue'
// import QuickListsHelpers from '@/2024-05-vue-orm-ui/quick-list/QuickListsHelpers'

export default {
    name: 'SuperTableGrid',
    components: {
        RecordOverview,
        RecordOverviewDynamic,
    },
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
        displayMapField: {
            type: Boolean,
            default() {
                return false
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
    methods: {
        deleteItem(e) {
            this.$emit('deleteItem', e)
        },
        editItem(e) {
            this.$emit('editItem', e)
        },
        clickRow(e) {
            this.$emit('clickRow', e)
        },
    },
    mounted() {
        // console.log(this.model.displayMapSummary)
    },
    computed: {
        // rowsAndDataIndicators() {
        //     return QuickListsHelpers.rowsAndDataIndicators(
        //         true,
        //         this.model,
        //         this.headers,
        //         []
        //     )
        // },
    }
}
</script>

<style scoped></style>
