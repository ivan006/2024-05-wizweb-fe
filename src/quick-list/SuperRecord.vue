<template>
  <div>

    <template v-if="treeMode">
      <SuperRecordTreeModeParent
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
    <template v-else>
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
  </div>
</template>

<script>
import SuperRecordTabMode from "./SuperRecordTabMode.vue";
import SuperRecordTreeModeParent from "./SuperRecordTreeModeParent.vue";

export default {
  name: "SuperRecord",
  components: {
    SuperRecordTreeModeParent,
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
    treeMode: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
};
</script>

<style lang="scss">
</style>
