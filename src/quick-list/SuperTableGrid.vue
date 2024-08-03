<template>
  <div>
    <div class="row q-mx-n2 justify-center">
      <template v-for="item in items" :key="item.name">
        <template
            v-if="
                templateListGrid &&
                templateListGrid.cols
              "
        >
          <div class="col-12 col-md-3 q-pa-sm" >
            <div class="q-card q-mx-auto" style="height: 100%; overflow: hidden;">
              <RecordOverviewDynamic
                  :item="item"
                  @clickRow="clickRow"
                  :clickable="true"
                  :maxFields="6"
                  :childRelations="[]"
                  isSummary
                  :superOptions="superOptions"
                  :template="templateListGrid"
                  @editItem="editItem"
                  @deleteItem="deleteItem"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div :class="`col-12 col-md-3 q-pa-sm`">
            <div class="q-card q-mx-auto" style="height: 100%">
              <RecordOverview
                  :item="item"
                  @clickRow="clickRow"
                  :clickable="true"
                  :maxFields="6"
                  :superOptions="superOptions"
              />
            </div>
          </div>
        </template>
      </template>
    </div>
    <template v-if="!items.length">
      <div class="text-center q-pa-md">No data available</div>
    </template>
  </div>
</template>

<script>
import RecordOverview from "./RecordOverview.vue";
import RecordOverviewDynamic from "./RecordOverviewDynamic.vue";

export default {
  name: "SuperTableGrid",
  components: {
    RecordOverview,
    RecordOverviewDynamic,
  },
  props: {
    templateListGrid: {
      type: Object,
      default() {
        return {};
      },
    },
    items: {
      type: Array,
      default() {
        return [];
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
      this.$emit("deleteItem", e);
    },
    editItem(e) {
      this.$emit("editItem", e);
    },
    clickRow(e) {
      this.$emit("clickRow", e);
    },
  },
};
</script>

<style scoped></style>
