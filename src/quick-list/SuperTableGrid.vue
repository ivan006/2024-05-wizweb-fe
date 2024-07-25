<template>
  <div>
    <div class="row q-mx-n2 justify-center">
      <template v-for="item in items" :key="item.name">
        <div class="col-12 col-md-3 q-pa-sm">
          <div class="q-card q-mx-auto" style="height: 100%">
            <template
                v-if="
                superOptions.model.displayMapSummary &&
                superOptions.model.displayMapSummary.rows
              "
            >
              <RecordOverviewDynamic
                  :item="item"
                  @clickRow="clickRow"
                  :clickable="true"
                  :maxFields="6"
                  :childRelations="[]"
                  isSummary
                  :superOptions="superOptions"
              />
            </template>
            <template v-else>
              <RecordOverview
                  :item="item"
                  @clickRow="clickRow"
                  :clickable="true"
                  :maxFields="6"
                  :superOptions="superOptions"
              />
            </template>
          </div>
        </div>
      </template>
    </div>
    <template v-if="!items.length">
      <div class="text-center">No data available</div>
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
          user: {},
          displayMapSummary: {},
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
