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
    this.loading = true;

    try {
      const response = await this.model.FetchById(this.id, this.relationships);
      const fetchedData = response.response.data.data;

      // Use tree skeleton to build the headers tree
      const treeSkeleton = this.buildTreeSkeleton(this.relationships);
      console.log(this.relationships)
      console.log(treeSkeleton)
      this.headersTree = this.buildHeadersTree(this.model, treeSkeleton);

      // Assign the fetched data reactively
      this.localData = { ...fetchedData }; // Ensures reactivity by creating a new object
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    buildTreeSkeleton(relationships) {
      const tree = {};

      relationships.forEach((path) => {
        const levels = path.split(".");
        let current = tree;

        levels.forEach((level) => {
          if (!current[level]) {
            current[level] = { name: level, children: {} };
          }
          current = current[level].children;
        });
      });

      function convertToTree(obj) {
        return Object.keys(obj).map((key) => ({
          name: key,
          children: convertToTree(obj[key].children),
        }));
      }

      return convertToTree(tree);
    },
    buildHeadersTree(model, treeSkeleton) {
      const headers = QuickListsHelpers.SupaerTableHeaders(model);

      return treeSkeleton.map(skeletonNode => {
        // Find a matching header for the current skeleton node
        const matchingHeader = headers.find(header => header.field === skeletonNode.field);

        if (!matchingHeader) {
          console.warn(`No matching header found for field: ${skeletonNode.field}`);
          return null; // Skip if no matching header is found
        }

        // Handle recursive relationships
        if (skeletonNode.children.length > 0) {
          const relatedModel =
              matchingHeader.meta.relation === "BelongsTo"
                  ? matchingHeader.meta.relatedModel
                  : matchingHeader.meta.field.related;

          if (!relatedModel) {
            console.warn(`No related model found for field: ${skeletonNode.field}`);
            return null; // Skip if no related model is defined
          }

          return {
            ...matchingHeader,
            children: this.buildHeadersTree(relatedModel, skeletonNode.children),
          };
        }

        // Return the header as-is if no children
        return matchingHeader;
      }).filter(Boolean); // Remove nulls
    }


  },
};
</script>
