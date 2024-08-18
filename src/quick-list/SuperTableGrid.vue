<template>
  <div>
    <div class="row q-col-gutter-md q-mx-n2 justify-center">
      <template v-for="item in items" :key="item.name">
        <template
            v-if="
                templateListGrid &&
                templateListGrid.cols
              "
        >
          <div class="col-12 col-md-3 " >
            <div class="q-card q-mx-auto" style="height: 100%; overflow: hidden;">
              <RecordFieldsForDisplayCustom
                  :item="item"
                  @clickRow="clickRow"
                  :maxFields="6"
                  :childRelations="[]"
                  isSummary
                  :superOptions="superOptions"
                  :template="templateListGrid"
                  @editItem="editItem"
                  @deleteItem="deleteItem"
                  :unClickable="unClickable"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <div :class="`col-12 col-md-3 `">
            <div class="q-card q-mx-auto" style="height: 100%">
              <RecordFieldsForDisplayGeneric
                  :item="item"
                  @clickRow="clickRow"
                  :maxFields="6"
                  :superOptions="superOptions"
                  @editItem="editItem"
                  @deleteItem="deleteItem"
                  :unClickable="unClickable"
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
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";

export default {
  name: "SuperTableGrid",
  components: {
    RecordFieldsForDisplayGeneric,
    RecordFieldsForDisplayCustom,
  },
  props: {
    unClickable: {
      type: Boolean,
      default() {
        return false;
      },
    },
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
      this.$emit("clickRow", e[this.superOptions.model.primaryKey], e);
    },
  },
};
</script>

<style scoped></style>
