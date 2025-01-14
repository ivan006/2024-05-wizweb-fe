<template>
  <div v-if="!loading">
    <q-expansion-item
        :label="'treeStructure.label'"
        :expanded.sync="true"
        :dense="true"
    >
      <template v-slot:default>
        <!-- Attributes -->
        <div v-for="attr in treeStructure.attrs" :key="attr.field" class="custom-attr">
          <span>{{ attr.label }}: </span>
          <span>{{ data[attr.field] }}</span>
        </div>

        <!-- Parents -->
        <div v-for="parent in treeStructure.parents" :key="parent.label" class="custom-parent">
          <span>{{ parent.label }}:</span>
          <SuperRecordTreeMode
              v-if="data[parent.field]"
              :headers="parent.structure"
              :data="data[parent.field]"
              :relationships="relationships"
              :template-overview="templateOverview"
              :template-form="templateForm"
              :configs-collection="configsCollection"
              :active="false"
          />
        </div>
      </template>
    </q-expansion-item>
  </div>
  <div v-else>
    <q-spinner size="lg" color="primary" />
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";

export default {
  name: "SuperRecordTreeMode",
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
    treeStructure: { type: Array, default: () => [] },
    active: { type: Boolean, default: true },
  },
  data() {
    return {
      loading: false,
    };
  },
  computed: {
    treeStructure() {
      if (!this.data) return null;

      // Attributes
      const attrs = this.headers.filter(
          header => !header.usageType.startsWith("relChildren") && !header.usageType.startsWith("relLookup")
      );

      // Parent relationships
      const parents = this.headers
          .filter(header => header.usageType.startsWith("relLookup"))
          .map(header => ({
            label: header.label,
            structure: QuickListsHelpers.SupaerTableHeaders(header.meta.relatedModel),
            field: header.field,
          }));

      return {
        label: this.model?.entity || "Record",
        attrs,
        parents,
      };
    },
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(this.model, [], this.canEdit, this.displayMapField);
    },
    superOptions() {
      return {
        headers: this.headers,
        modelFields: QuickListsHelpers.computedAttrs(this.model, []),
        displayMapField: this.displayMapField,
        model: this.model,
        canEdit: this.canEdit,
      };
    },
    canEdit() {
      return true;
    },
  },
  methods: {
    async fetchData() {
      if (!this.active) return;

      this.loading = true;
      try {
        const response = await this.model.FetchById(this.id, this.relationships);
        this.$emit("update:data", response.response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    if (this.active) {
      this.fetchData();
    }
  },
};
</script>

<style lang="scss">
.custom-attr {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
}

.custom-parent {
  margin-top: 1rem;
}

q-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}
</style>
