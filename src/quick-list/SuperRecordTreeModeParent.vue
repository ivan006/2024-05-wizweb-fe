<template>
  <div v-if="!loading">
    <SuperRecordTreeModeRecursive
        :headers-tree="headersTree"
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
      loading: true,
      headersTree: [],
    };
  },
  async mounted() {
    if (!this.active) return;

    try {
      const response = await this.model.FetchById(this.id, this.relationships);
      this.data = response.response.data.data;
      this.headersTree = this.buildHeadersTree(this.model, null, null);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    /**
     * Build recursive headers tree with exclusion logic.
     * @param {Object} model - The model to generate headers for.
     * @param {String|null} excludedRel - The field name of the excluded relation.
     * @param {String|null} excludedRelType - The relation type ("BelongsTo" or "HasMany").
     */
    buildHeadersTree(model, excludedRel = null, excludedRelType = null) {
      return QuickListsHelpers.SupaerTableHeaders(model).map(header => {
        // Exclude specific relations
        if (header.usageType.startsWith("relLookup") && header.meta.relation === "BelongsTo") {
          if (header.meta.field.foreignKey === excludedRel && excludedRelType === "BelongsTo") {
            return null;
          }
          return {
            ...header,
            children: this.buildHeadersTree(
                header.meta.relatedModel,
                header.meta.field.foreignKey,
                "HasMany" // Inverse of BelongsTo
            ),
          };
        }

        if (header.usageType.startsWith("relChildren") && header.meta.relation === "HasMany") {
          if (header.meta.field.foreignKey === excludedRel && excludedRelType === "HasMany") {
            return null;
          }
          return {
            ...header,
            children: this.buildHeadersTree(
                header.meta.relatedModel,
                header.meta.field.foreignKey,
                "BelongsTo" // Inverse of HasMany
            ),
          };
        }

        // Return normal headers and attributes
        return header;
      }).filter(Boolean); // Remove null values
    },
  },
};
</script>
