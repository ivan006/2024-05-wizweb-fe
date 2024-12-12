<template>
  <div>

    <template
        v-for="filterInput of filterInputs"
        :key="filterInput.name"
    >
      <!--<SuperTable-->
      <!--    :isForSelectingRelation="true"-->
      <!--    :canEdit="false"-->
      <!--    v-model="modelValueRef[filterInput.name]"-->
      <!--    v-model:titleVal="filterNamesRef[filterInput.name]"-->
      <!--    :model="filterInput.meta.field.parent"-->
      <!--    :rules="[() => true]"-->
      <!--    :modelField="filterInput"-->
      <!--    class="q-mr-sm"-->
      <!--/>-->
    </template>
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";
import SuperTable from "./SuperTable.vue";

export default {
  name: "BreadcrumbsFilterAutoSuggest",
  components: {SuperTable},
  data() {
    return {
      filterValsRef: {},
      filterNamesRef: {},
    };
  },
  props: {
    // filterNames: {
    //   type: Object,
    //   default() {
    //     return {};
    //   },
    // },
    // filterVals: {
    //   type: Object,
    //   default() {
    //     return {};
    //   },
    // },
    model: {
      type: [Object, Function],
      required: true,
    },
  },
  computed: {

    modelFields() {
      const result = QuickListsHelpers.computedAttrs(
          this.model,
          [],
      );
      return result;
    },
    filterInputs() {
      const data = this.modelFields;

      return QuickListsHelpers.filterInputs(data)
    },
  },
  mounted(){

    QuickListsHelpers.bindDeepPropToRef(this, [
      { prop: "filterVals", refName: "filterValsRef" },
      { prop: "filterNames", refName: "filterNamesRef" },
    ]);
  }
}
</script>

<style scoped>

</style>