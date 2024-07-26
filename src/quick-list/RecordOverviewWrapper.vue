<template>
  <div>
    <template v-if="templateOverview && templateOverview.rows">
      <RecordOverviewDynamic
        :item="item"
        :childRelations="childRelations"
        :filteredChildRelations="filteredChildRelations"
        :superOptions="superOptions"
        :template="templateOverview"
      >
        <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps"></slot>
        </template>
      </RecordOverviewDynamic>
    </template>
    <template v-else>
      <RecordOverview
        :item="item"
        :superOptions="superOptions"
      />
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
          user: {},
        };
      },
    },
  },
  // methods: {
  //   deleteItem(e) {
  //     this.$emit('deleteItem', e);
  //   },
  //   editItem(e) {
  //     this.$emit('editItem', e);
  //   },
  //   clickRow(e) {
  //     this.$emit('clickRow', e);
  //   },
  // },
};
</script>

<style scoped></style>
