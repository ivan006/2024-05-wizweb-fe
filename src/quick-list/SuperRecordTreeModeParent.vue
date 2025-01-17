<template>
  <div>
    <q-spinner v-if="loading" size="lg" color="primary" />
    <div v-else>
      <SuperRecordTreeModeRecursive
          :headers-tree="headersTree"
          :data="localData"
      />
    </div>
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
      localData: {}, // Create a local copy of the data prop
    };
  },
  async mounted() {
    if (!this.active) return;

    try {
      const response = await this.model.FetchById(this.id, this.relationships);
      this.localData = response.response.data.data; // Assign to localData
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
      const headers = QuickListsHelpers.SupaerTableHeaders(model); // Get headers for the current model

      return headers.map(header => {
        // Handle parent relationships (BelongsTo)
        if (header.usageType.startsWith("relLookup") && header.meta.relation === "BelongsTo") {
          return {
            ...header,
            children: this.buildHeadersTree(
                header.meta.relatedModel, // Use related model for the relationship
                header.meta.field.foreignKey, // Set excluded relation to avoid processing inverse
                "HasMany" // Inverse of BelongsTo
            ),
          };
        }

        // Handle child relationships (HasMany)
        if (header.usageType.startsWith("relChildren") && header.meta.relation === "HasMany") {
          return {
            ...header,
            children: this.buildHeadersTree(
                header.meta.field.related, // Use field.related for HasMany relationships
                header.meta.field.foreignKey, // Set excluded relation for inverse
                "BelongsTo" // Inverse of HasMany
            ),
          };
        }

        // Return non-relationship fields as-is
        return header;
      });
    }

  },
};
</script>
