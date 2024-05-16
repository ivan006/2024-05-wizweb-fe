<template>
    <div :style="clickable ? 'cursor: pointer' : ''" @click="clickRow(item)">
        <template v-for="(header, index) in headers">
            <div
                :key="header.name"
                v-if="
                    header.value !== 'id' &&
                    (index < maxFields || header.type == 'actions')
                "
                style="min-height: 1.375rem"
            >
                <template v-if="index < 2">
                    <template v-if="headers[0].value == 'id'">
                        <template v-if="index == 0"></template>
                        <template v-else>
                            <v-card-title>
                                <FormattedColumn
                                    :header="header"
                                    :item="item"
                                    @deleteItem="deleteItem"
                                    @editItem="editItem"
                                    :displayMapField="displayMapField"
                                    :model="model"
                                    :canEdit="canEdit"
                                    :currentParentRecord="currentParentRecord"
                                />
                            </v-card-title>
                        </template>
                    </template>
                    <template v-else>
                        <template v-if="index == 0">
                            <v-card-title>
                                <FormattedColumn
                                    :header="header"
                                    :item="item"
                                    @deleteItem="deleteItem"
                                    @editItem="editItem"
                                    :displayMapField="displayMapField"
                                    :model="model"
                                    :canEdit="canEdit"
                                    :currentParentRecord="currentParentRecord"
                                />
                            </v-card-title>
                        </template>
                        <template v-else>
                            <v-card-text>
                                <div class="text-caption">
                                    {{ header.title }}
                                </div>
                                <FormattedColumn
                                    :key="index"
                                    :header="header"
                                    :item="item"
                                    @deleteItem="deleteItem"
                                    @editItem="editItem"
                                    :displayMapField="displayMapField"
                                    :model="model"
                                    :canEdit="canEdit"
                                    :currentParentRecord="currentParentRecord"
                                />
                            </v-card-text>
                        </template>
                    </template>
                </template>
                <template v-else>
                    <v-card-text>
                        <div class="text-caption">
                            {{ header.title }}
                        </div>
                        <FormattedColumn
                            :key="index"
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
                    </v-card-text>
                </template>
            </div>
        </template>
    </div>
</template>

<script>
import FormattedColumn from '@/views/global/quick-list/FormattedColumn.vue'

export default {
    name: 'RecordOverview',
    components: { FormattedColumn },
    props: {
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
}
</script>

<style scoped></style>
