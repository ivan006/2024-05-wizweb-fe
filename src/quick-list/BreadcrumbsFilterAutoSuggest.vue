<template>
  <div>
    <pre>{{filterValsRef}}</pre>
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
    lastNonDefaultIndex: {
      type: Number,
      default() {
        return 0;
      },
    },
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
      // Find the index of the next filter after the last non-default filter
      const nextIndex = this.lastNonDefaultIndex + 1;

      // Check if the index exists in the filterInputs array
      return this.filterInputs[nextIndex] || null;
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
