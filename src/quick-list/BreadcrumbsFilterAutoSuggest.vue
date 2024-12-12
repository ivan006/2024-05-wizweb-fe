<template>
  <div>
    <template v-if="nextFilter">
      <SuperTable
          :isForSelectingRelation="true"
          :canEdit="false"
          v-model="filterValsRef[nextFilter.name]"
          v-model:titleVal="filterNamesRef[nextFilter.name]"
          :model="nextFilter.meta.field.parent"
          :rules="[() => true]"
          :modelField="nextFilter"
          class="q-mr-sm"
      />
    </template>
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";
import SuperTable from "./SuperTable.vue";

export default {
  name: "BreadcrumbsFilterAutoSuggest",
  components: { SuperTable },
  data() {
    return {
      filterValsRef: {},
      filterNamesRef: {},
    };
  },
  props: {
    filterNames: {
      type: Object,
      default() {
        return {};
      },
    },
    filterVals: {
      type: Object,
      default() {
        return {};
      },
    },
    model: {
      type: [Object, Function],
      required: true,
    },
  },
  computed: {
    modelFields() {
      return QuickListsHelpers.computedAttrs(this.model, []);
    },
    filterInputs() {
      return QuickListsHelpers.filterInputs(this.modelFields);
    },
    nextFilter() {
      // Find the index of the lowest set filter
      const lowestSetIndex = this.filterInputs.findIndex((filterInput) => {
        const val = this.filterValsRef[filterInput.name];
        return val !== 0 && val !== null; // Check if set to a specific value
      });

      // If no filters are set, prompt for the first one
      if (lowestSetIndex === -1) return this.filterInputs[0];

      // Otherwise, prompt for the filter immediately after the lowest set one
      return this.filterInputs[lowestSetIndex + 1] || null;
    },
  },
  mounted() {
    QuickListsHelpers.bindDeepPropToRef(this, [
      {prop: "filterVals", refName: "filterValsRef"},
      {prop: "filterNames", refName: "filterNamesRef"},
    ]);
  },
};
</script>

<style scoped></style>
