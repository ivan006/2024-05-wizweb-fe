<template>
  <SuperRecordTabMode
      :configsCollection="configsCollection"
      :allowedTabs="allowedTabs"
      :templateOverview="templateOverview"
      :templateForm="templateForm"
      :model="model"
      :id="id"
      :displayMapField="displayMapField"
      :relationships="relationships"
      :deleteItem="$emit('deleteItem')"
      :editItem="$emit('editItem')"
      :initialLoadHappened="$emit('initialLoadHappened')"
      :update:item="$emit('update:item')"
  />
</template>

<script>
import SuperRecordTabMode from "./SuperRecordTabMode.vue";

export default {
  name: "SuperRecord",
  components: {
    SuperRecordTabMode,
  },
  props: {
    configsCollection: {
      type: Object,
      default: {},
    },
    allowedTabs: {
      type: Array,
      default() {
        return [];
      },
    },
    templateOverview: {
      type: Object,
      default() {
        return {};
      },
    },
    templateForm: {
      type: Object,
      default() {
        return {};
      },
    },
    model: {
      type: [Object, Function],
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    displayMapField: {
      type: Boolean,
      default: false,
    },
    relationships: {
      type: Array,
      default() {
        return [];
      },
    },
  },
};
</script>

<style lang="scss">
</style>
