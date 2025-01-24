<template>
  <div class="q-pa-sm">
    <q-spinner v-if="loading" size="lg" color="primary" />
    <div v-else>
      <SuperRecordTreeModeChild
          :relation-tree="relationTree"
          :data="item"
          @fetchData="fetchData"
      />
    </div>
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";
import SuperRecordTreeModeChild from "./SuperRecordTreeModeChild.vue";
import OverviewTab from "./OverviewTab.vue";

export default {
  name: "SuperRecordTreeModeParent",
  components: {OverviewTab, SuperRecordTreeModeChild },
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
    superOptions: {
      type: Object,
      default: {},
    },
    item: {
      type: Object,
      default: {},
    },
    loading: {
      type: Boolean,
      default: false,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      relationTree: {},
    };
  },
  async mounted() {

    const treeSkeleton = this.buildTreeSkeleton(this.relationships);
    this.relationTree = this.buildRelationTree(treeSkeleton, this.model);
  },
  methods: {
    fetchData(e) {
      this.$emit("fetchData", e);
    },
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
    buildRelationTree(treeSkeleton, model) {
      const buildTree = (skeleton, currentModel) => {
        const headers = QuickListsHelpers.SupaerTableHeaders(currentModel);

        return {
          model: currentModel,
          headers: headers.map((header) => {
            const isRelation =
                header.usageType?.startsWith("relLookup") ||
                header.usageType?.startsWith("relChildren");

            if (isRelation) {
              const relatedNode = skeleton.find((node) => node.name === header.field);

              if (relatedNode) {
                const relatedModel =
                    header.meta.relation === "BelongsTo"
                        ? header.meta.relatedModel
                        : header.meta.field?.related;

                return {
                  ...header,
                  children: buildTree(relatedNode.children, relatedModel),
                };
              }

              return null;
            }

            return {...header, children: []};
          }).filter(Boolean),
        };
      };

      return buildTree(treeSkeleton, model);
    },
  },
};
</script>
