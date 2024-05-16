<template>
    <div style="max-height: 330px; overflow-y: scroll">
        <v-list density="compact">
            <v-list-item-group :modelValue="modelValue" color="primary">
                <v-list-item
                    v-for="(item, i) in items"
                    :key="i"
                    :modelValue="item.id"
                    @click="clickRow(item)"
                >
                    <v-list-item-content>
                        <v-list-item-title>
                            <FormattedColumn :header="title" :item="item" />
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </div>
</template>

<script>
import FormattedColumn from '@/views/global/quick-list/FormattedColumn.vue'

export default {
    name: 'SuperTableList',
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
        modelValue: {
            type: Number,
            default() {
                return null
            },
        },
    },
    methods: {
        clickRow(e) {
            this.$emit('update:modelValue', e)
        },
    },
    computed: {
        title() {
            const result = this.headers.find((header) => header.value !== 'id')
            return result
        },
    },
}
</script>

<style scoped></style>
