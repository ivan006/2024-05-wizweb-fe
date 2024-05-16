<template>
    <div
        :style="clickable ? 'cursor: pointer' : ''"
        @click="clickRow(item)"
        class="pa-2"
    >
        <!--        <v-container class="d-flex flex-column" style="height: 100%;">-->
        <template v-for="(row, index) in rows" :key="index">
            <v-row no-gutters >
                <template v-for="(col, index2) in row.cols" :key="index2">
                    <v-col :cols="col.width" >
                        <template v-if="col.rows">
                            <template v-for="(row2, index3) in col.rows" :key="index3">
                                <v-row no-gutters >
                                    <template
                                        v-for="(col2, index4) in row2.cols"
                                        :key="index4"
                                    >
                                        <v-col :cols="col2.width" >
                                            <RecordOverviewDynamicDataPoint
                                                :currentParentRecord="
                                                    currentParentRecord
                                                "
                                                :item="item"
                                                :canEdit="canEdit"
                                                :dataPoint="col2.dataPoint"
                                                :model="model"
                                                :headers="headers"
                                                :displayMapField="
                                                    displayMapField
                                                "
                                                :childRelations="childRelations"
                                                @deleteItem="deleteItem"
                                                @editItem="editItem"
                                                @clickRow="clickRow"
                                            />
                                        </v-col>
                                    </template>
                                </v-row>
                            </template>
                        </template>
                        <template v-else>
                            <RecordOverviewDynamicDataPoint
                                :currentParentRecord="currentParentRecord"
                                :item="item"
                                :canEdit="canEdit"
                                :dataPoint="col.dataPoint"
                                :model="model"
                                :headers="headers"
                                :displayMapField="displayMapField"
                                :childRelations="childRelations"
                                @deleteItem="deleteItem"
                                @editItem="editItem"
                                @clickRow="clickRow"
                            />
                        </template>
                    </v-col>
                </template>
            </v-row>
        </template>
        <!-- </v-container>-->
    </div>
</template>

<script>
import RecordOverviewDynamicDataPoint from '@/views/global/quick-list/RecordOverviewDynamicDataPoint.vue'

export default {
    name: 'RecordOverviewDynamic',
    components: {
        RecordOverviewDynamicDataPoint,
    },
    props: {
        isSummary: {
            type: Boolean,
            default() {
                return false
            },
        },
        childRelations: {
            type: Array,
            default() {
                return []
            },
        },
        headers: {
            type: Array,
            default() {
                return []
            },
        },
        item: {
            type: Object,
            default() {
                return {}
            },
        },
        clickable: {
            type: Boolean,
            default() {
                return false
            },
        },
        maxFields: {
            type: Number,
            default() {
                return 999
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
        rowsAndDataIndicators: {
            type: Object,
            default() {
                return {}
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
    computed: {
        rows() {

            let result = []
            if (this.isSummary) {
                if (
                    this.model.displayMapSummary &&
                    this.model.displayMapSummary.rows
                ) {
                    result = this.model.displayMapSummary.rows
                }
            } else {
                if (
                    this.model.displayMapFull &&
                    this.model.displayMapFull.rows
                ) {
                    result = this.model.displayMapFull.rows
                }
            }
            return result
        },
    },
    mounted() {},
}
</script>

<style scoped></style>
