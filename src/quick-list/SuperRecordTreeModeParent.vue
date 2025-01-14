<template>
  <div>
    <div v-if="!loading && data">
      <SuperRecordTreeModeRecursive
          :headers="headers"
          :data="data"
      />
    </div>
    <div v-else>
      <q-spinner size="lg" color="primary" />
    </div>
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";
import SuperRecordTreeModeRecursive from "./SuperRecordTreeModeRecursive.vue";

export default {
  name: "SuperRecordTreeModeParent",
  components: {
    SuperRecordTreeModeRecursive,
  },
  props: {
    configsCollection: { type: Object, default: () => ({}) },
    allowedTabs: { type: Array, default: () => [] },
    templateOverview: { type: Object, default: () => ({}) },
    templateForm: { type: Object, default: () => ({}) },
    model: { type: [Object, Function], required: true },
    id: { type: Number, required: true },
    displayMapField: { type: Boolean, default: false },
    relationships: { type: Array, default: () => [] },
  },
  data() {
    return {
      data: null,
      loading: true,
    };
  },
  computed: {
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(this.model, [], this.canEdit, this.displayMapField);
    },
    canEdit() {
      return true;
    },
  },
  methods: {
    async fetchData() {
      try {
        const response = await this.model.FetchById(this.id, this.relationships);
        this.data = response.response.data.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style lang="scss">
q-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}
</style>
