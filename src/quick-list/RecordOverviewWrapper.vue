<template>
  <div>
    <template v-if="Object.keys(item).length === 0 && item.constructor === Object ">
      <div class="text-center q-pa-md">No data available</div>
    </template>
    <template v-else>
      <template v-if="templateOverview && templateOverview.cols">
        <div style="padding-top:0.03px;">
          <div class="row q-col-gutter-xs">
            <RecordOverviewDynamic
                :item="item"
                :childRelations="childRelations"
                :filteredChildRelations="filteredChildRelations"
                :superOptions="superOptions"
                :template="templateOverview"
                @editItem="editItem"
                @deleteItem="deleteItem"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </RecordOverviewDynamic>
          </div>
        </div>
      </template>
      <template v-else>
        <RecordOverview
            :item="item"
            :superOptions="superOptions"
        />
      </template>
    </template>

  </div>
</template>

<script>

import RecordOverview from "./RecordOverview.vue";
import RecordOverviewDynamic from "./RecordOverviewDynamic.vue";

export default {
  name: 'RecordOverviewWrapper',
  components: {RecordOverviewDynamic, RecordOverview },
  props: {
    templateOverview: {
      type: Object,
      default() {
        return {};
      },
    },
    filteredChildRelations: {
      type: Array,
      default() {
        return [];
      },
    },
    childRelations: {
      type: Array,
      default() {
        return [];
      },
    },
    item: {
      type: Object,
      default() {
        return {};
      },
    },
    superOptions: {
      type: Object,
      default() {
        return {
          headers: [],
          modelFields: [],
          displayMapField: false,
          model: {},
          canEdit: false,
          currentParentRecord: {},
        };
      },
    },
  },
  methods: {
    deleteItem(e) {
      this.$emit('deleteItem', e);
    },
    editItem(e) {
      this.$emit('editItem', e);
    },
    clickRow(e) {
      this.$emit('clickRow', e);
    },
  },
};
</script>

<style scoped></style>
