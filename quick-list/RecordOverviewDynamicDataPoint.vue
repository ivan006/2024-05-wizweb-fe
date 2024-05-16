<template>
    <div>
        <template v-if="dataPoint.xOrientation">
            <div class="">
                <div class="d-flex flex-row">
                    <div class="pr-2">
                        <!-- Content of the first column -->

                        <template v-if="!dataPoint.hideLabel">
                            <div
                                class="text-caption"
                                style="line-height: 1.6rem"
                            >
                                {{ compHeader.title }}:
                            </div>
                        </template>
                    </div>
                    <div>
                        <!-- Content of the second column -->
                        <component
                            :is="dataPoint.tag ? dataPoint.tag : 'div'"
                            :class="dataPoint.class ? dataPoint.class : ''"
                        >
                            <template
                                v-if="
                                    compHeader.usageType.startsWith(
                                        'relChildren'
                                    )
                                "
                            >
                                <div class="pt-1">
                                    <template v-if="compRelation">
                                        <SuperTable
                                            :currentParentRecord="
                                                compRelation.currentParentRecord
                                            "
                                            :model="
                                                compRelation.field.meta.field
                                                    .related
                                            "
                                            :canEdit="canEdit"
                                            :defaultViewModeProp="
                                                dataPoint.relationViewMode
                                                    ? dataPoint.relationViewMode
                                                    : 'table'
                                            "
                                        />
                                    </template>
                                </div>
                            </template>
                            <template v-else>
                                <FormattedColumn
                                    :header="compHeader"
                                    :item="item"
                                    @deleteItem="deleteItem"
                                    @editItem="editItem"
                                    :displayMapField="displayMapField"
                                    :model="model"
                                    :canEdit="canEdit"
                                    :currentParentRecord="currentParentRecord"
                                />
                            </template>
                        </component>
                    </div>
                </div>
                <!--                                <v-card-text-->
                <!--                                    class="d-flex flex-column"-->
                <!--                                    style="height: 100%"-->
                <!--                                >-->

                <!--                                </v-card-text>-->
            </div>
        </template>
        <template v-else>
            <div class="d-flex flex-column" style="height: 100%">
                <template v-if="!dataPoint.hideLabel">
                    <div class="text-caption">
                        {{ compHeader.title }}
                    </div>
                </template>

                <!--<component :key="index" :is="dataPoint.tag" :class="dataPoint.class">-->
                <component
                    :is="dataPoint.tag ? dataPoint.tag : 'div'"
                    :class="dataPoint.class ? dataPoint.class : ''"
                >
                    <template
                        v-if="compHeader.usageType.startsWith('relChildren')"
                    >
                        <div class="pt-1">
                            <template v-if="compRelation">
                                <SuperTable
                                    :currentParentRecord="
                                        compRelation.currentParentRecord
                                    "
                                    :model="
                                        compRelation.field.meta.field.related
                                    "
                                    :canEdit="canEdit"
                                    :defaultViewModeProp="
                                        dataPoint.relationViewMode
                                            ? dataPoint.relationViewMode
                                            : 'table'
                                    "
                                />
                            </template>
                        </div>
                    </template>
                    <template v-else>
                        <FormattedColumn
                            :header="compHeader"
                            :item="item"
                            @deleteItem="deleteItem"
                            @editItem="editItem"
                            :displayMapField="displayMapField"
                            :model="model"
                            :canEdit="canEdit"
                            :currentParentRecord="currentParentRecord"
                        />
                    </template>
                </component>
            </div>
        </template>
    </div>
</template>

<script>
import FormattedColumn from '@/views/global/quick-list/FormattedColumn.vue'
import { defineAsyncComponent } from 'vue';

export default {
    name: 'RecordOverviewDynamicDataPoint',
    components: {
        SuperTable: defineAsyncComponent(() =>
          import('@/views/global/quick-list/SuperTable.vue')
        ),
        FormattedColumn,
    },
    props: {
        dataPoint: {
            type: Object,
            default() {
                return {}
            },
        },
        canEdit: {
            type: Boolean,
            default() {
                return false
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
        model: {
            type: [Object, Function],
            required: true,
        },
        currentParentRecord: {
            type: Object,
            default() {
                return null
            },
        },
        childRelations: {
            type: Array,
            default() {
                return []
            },
        },

        // rowsAndDataIndicators: {
        //     type: Object,
        //     default() {
        //         return {}
        //     },
        // },
        headers: {
            type: Array,
            default() {
                return []
            },
        },
        // clickable: {
        //     type: Boolean,
        //     default() {
        //         return false
        //     },
        // },
        // maxFields: {
        //     type: Number,
        //     default() {
        //         return 999
        //     },
        // },
        // modelFields: {
        //     type: Array,
        //     default() {
        //         return []
        //     },
        // },
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
        compHeader() {
            const result = this.headers.find((header) => {
                return header.value == this.dataPoint.data
            })
            // console.log(this.dataPoint.data)
            // console.log("this.headers")
            // console.log(this.headers)
            // console.log(result)
            return result
        },
        compRelation() {
            let result = {}

            if (this.compHeader.usageType.startsWith('relChildren')) {
                result = this.childRelations.find((relation) => {
                    return relation.field.name == this.dataPoint.data
                })
            }

            return result
        },
    },
}
</script>

<style scoped></style>
