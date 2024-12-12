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
      // Determine the next filter in rank that is not yet set
      return this.filterInputs.find(
          (filterInput) =>
              !this.filterValsRef[filterInput.name] ||
              this.filterValsRef[filterInput.name] === 0
      );
    },
  },
  mounted() {
    QuickListsHelpers.bindDeepPropToRef(this, [
      { prop: "filterVals", refName: "filterValsRef" },
      { prop: "filterNames", refName: "filterNamesRef" },
    ]);
  },
};
</script>

<style scoped></style>
