<template>
  <div>
    <q-expansion-item
        :expanded.sync="computedTreeStructure[0]?.expanded"
        :dense="true"
        v-if="computedTreeStructure.length"
    >
      <template v-slot:header>
        <div class="custom-record">
          <strong>{{ computedTreeStructure[0]?.label }}</strong>
          <q-btn-group>
            <q-btn flat round icon="visibility" @click="viewNode(computedTreeStructure[0])" />
            <q-btn flat round icon="edit" @click="editNode(computedTreeStructure[0])" />
            <q-btn flat round icon="delete" color="negative" @click="deleteNode(computedTreeStructure[0])" />
          </q-btn-group>
        </div>
      </template>
      <template v-slot:default>
        <div v-for="node in computedTreeStructure[0].children" :key="node.label">
          <div v-if="node.type === 'record'">
            <div class="custom-record">
              <strong>{{ node.label }}</strong>
              <q-btn-group>
                <q-btn flat round icon="visibility" @click="viewNode(node)" />
                <q-btn flat round icon="edit" @click="editNode(node)" />
                <q-btn flat round icon="delete" color="negative" @click="deleteNode(node)" />
              </q-btn-group>
            </div>
          </div>

          <div v-else-if="node.type === 'attr'">
            <div class="custom-attr">
              <span>{{ node.label }}: </span>
              <span>{{ node.value }}</span>
            </div>
          </div>

          <div v-else-if="node.type === 'parent'">
            <div class="custom-parent">
              <span>Parent: </span>
              <SuperRecordTreeMode
                  :tree-structure="node.children"
                  :data="node.data"
                  :relationships="node.relations"
                  :active="false"
              />
            </div>
          </div>

          <q-expansion-item
              v-if="node.type === 'child'"
              :label="node.label"
              :expanded.sync="node.expanded"
              :dense="true"
          >
            <template v-slot:default>
              <SuperRecordTreeMode
                  :tree-structure="node.children"
                  :data="node.data"
                  :relationships="node.relations"
                  :active="false"
              />
            </template>
          </q-expansion-item>
        </div>
      </template>
    </q-expansion-item>
    <pre>{{computedTreeStructure}}</pre>
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
      if (!this.active) return;
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
          label: this.model.entity,
          type: "record",
          children: [...attrs, ...(parentRelations ? [parentRelations] : []), ...childGroups],
        },
      ];

      return treeNodes;
    },
    viewNode(node) {
      console.log("View node:", node);
    },
    editNode(node) {
      console.log("Edit node:", node);
    },
    deleteNode(node) {
      console.log("Delete node:", node);
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
