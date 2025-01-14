<template>
  <div>
    <q-tree
        :nodes="computedTreeStructure"
        node-key="label"
        default-expand-all
        @lazy-load="handleLazyLoad"
    >
      <template v-slot:default="props">
        <div>
          <template v-if="props.node.type === 'record'">
            <div class="custom-record">
              <strong>{{ props.node.label }}</strong>
              <q-btn-group>
                <q-btn flat round icon="visibility" @click="viewNode(props.node)" />
                <q-btn flat round icon="edit" @click="editNode(props.node)" />
                <q-btn flat round icon="delete" color="negative" @click="deleteNode(props.node)" />
              </q-btn-group>
            </div>
          </template>

          <template v-else-if="props.node.type === 'attr'">
            <div class="custom-attr">
              <span>{{ props.node.label }}: </span>
              <span>{{ props.node.value }}</span>
              <q-btn-group>
                <q-btn flat round icon="visibility" @click="viewNode(props.node)" />
                <q-btn flat round icon="edit" @click="editNode(props.node)" />
                <q-btn flat round icon="delete" color="negative" @click="deleteNode(props.node)" />
              </q-btn-group>
            </div>
          </template>

          <template v-else-if="props.node.type === 'parent'">
            <div class="custom-parent">
              <span>Parent: </span>
              <SuperRecordTreeMode
                  :tree-structure="props.node.children"
                  :data="props.node.data"
                  :relationships="props.node.relations"
                  :active="false"
              />
              <q-btn-group>
                <q-btn flat round icon="visibility" @click="viewNode(props.node)" />
                <q-btn flat round icon="edit" @click="editNode(props.node)" />
                <q-btn flat round icon="delete" color="negative" @click="deleteNode(props.node)" />
              </q-btn-group>
            </div>
          </template>
        </div>
      </template>
    </q-tree>
    <pre>{{computedTreeStructure}}</pre>
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";

export default {
  name: "SuperRecordTreeMode",
  props: {
    configsCollection: {
      type: Object,
      default: () => ({}),
    },
    allowedTabs: {
      type: Array,
      default: () => [],
    },
    templateOverview: {
      type: Object,
      default: () => ({}),
    },
    templateForm: {
      type: Object,
      default: () => ({}),
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
      default: () => [],
    },
    data: {
      type: Object,
      default: null,
    },
    treeStructure: {
      type: Array,
      default: () => [],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      loading: false,
      computedTreeStructure: [],
    };
  },
  computed: {
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
      if (!this.active) return; // Skip fetching if passive

      this.loading = true;
      try {
        const response = await this.model.FetchById(this.id, this.relationships);
        const fetchedData = response.response.data.data;
        this.computedTreeStructure = this.computeTreeStructure(fetchedData, this.relationships);
        this.$emit("update:data", fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },

    computeTreeStructure(data, relationships) {
      const attrs = this.headers
          .filter(header => !header.usageType.startsWith("relChildren"))
          .map(header => ({
            type: "attr",
            label: header.label,
            value: data[header.field],
          }));

      const parentRelations = relationships
          .filter(relation => relation.type === "parent")
          .map(relation => ({
            label: relation.label || relation.name,
            type: "parent",
            children: data[relation.name]?.map(childData => this.computeTreeStructure(childData, relation.children || [])) || [],
            data: data[relation.name],
            relations: relation.children || [],
          }))[0] || null;

      const childGroups = relationships
          .filter(relation => relation.type === "child")
          .map(relation => ({
            label: relation.label || relation.name,
            type: "child",
            children: data[relation.name]?.map(childData => this.computeTreeStructure(childData, relation.children || [])) || [],
            data: data[relation.name],
            relations: relation.children || [],
          }));

      const treeNodes = [
        {
          label: this.model.entity, // Root record label
          type: "record",
          children: [...attrs, ...(parentRelations ? [parentRelations] : []), ...childGroups],
        },
      ];

      return treeNodes;
    },

    handleLazyLoad(node, done) {
      if (!node.children || node.children.length === 0) {
        done();
        return;
      }
      done();
    },

    viewNode(node) {
      console.log("View node:", node);
      // Add logic for viewing node details
    },

    editNode(node) {
      console.log("Edit node:", node);
      // Add logic for editing node
    },

    deleteNode(node) {
      console.log("Delete node:", node);
      // Add logic for deleting node
    },
  },
  mounted() {
    if (this.active) {
      this.fetchData();
    } else {
      this.computedTreeStructure = this.treeStructure;
    }
  },
};
</script>

<style lang="scss">
.custom-record,
.custom-attr,
.custom-parent {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
}
</style>
