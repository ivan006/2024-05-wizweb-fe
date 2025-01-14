<template>
  <div>
    <SuperRecordTreeModeRecursive
        :headers="headers"
        :data="data"
    />
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";
import SuperRecordTreeModeRecursive from "./SuperRecordTreeModeRecursive.vue";

export default {
  name: "SuperRecordTreeModeParent",
  components: { SuperRecordTreeModeRecursive },
  props: {
    configsCollection: { type: Object, default: () => ({}) },
    allowedTabs: { type: Array, default: () => [] },
    templateOverview: { type: Object, default: () => ({}) },
    templateForm: { type: Object, default: () => ({}) },
    model: { type: [Object, Function], required: true },
    id: { type: Number, required: true },
    displayMapField: { type: Boolean, default: false },
    relationships: { type: Array, default: () => [] },
    data: { type: Object, default: null },
    active: { type: Boolean, default: true },
  },
  data() {
    return {
      loading: false,
      headers: [],
    };
  },
  async mounted() {
    if (!this.active) return;
    this.loading = true;

    try {
      const response = await this.model.FetchById(this.id, this.relationships);
      const fetchedData = response.response.data.data;
      this.headers = QuickListsHelpers.SupaerTableHeaders(this.model);
      this.$emit("update:data", fetchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.loading = false;
    }
  },
};
</script>
