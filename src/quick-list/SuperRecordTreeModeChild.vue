<template>
  <q-tree
      :nodes="treeNodes"
      node-key="id"
      @update:selected="onNodeSelected"
  >
    <template v-slot:default-header="prop">
      <div>
        <template v-if="prop.node.type === 'attr'">
          <strong style="display: inline-block; min-width: 100px;">
            {{ prop.node.label }}:
          </strong>
          {{ prop.node.value }}
        </template>
        <template v-else-if="prop.node.type === 'parent'">
          <strong style="display: inline-block; min-width: 100px;">
            {{ prop.node.label }}:
          </strong>
          {{ prop.node.value }}
        </template>
        <template v-else-if="prop.node.type === 'childGroup'">
          <strong style="display: inline-block; min-width: 100px;">
            {{ prop.node.label }}
          </strong>
        </template>
        <template v-else-if="prop.node.type === 'actions'">
          <DatapointForDisplayInner
              :header="prop.node.header"
              :item="prop.node.data"
              :superOptions="{
                // headers: header,
                modelFields: [],
                displayMapField: false,
                model: prop.node.relationTree.model,
                canEdit: false,
                currentParentRecord: {},
              }"
              @editItem="editItem"
              @deleteItem="deleteItem"
          />
          <!--:superOptions="superOptions"-->
        </template>
        <template v-else>
          {{ prop.node.value }}
        </template>
      </div>
    </template>
  </q-tree>
</template>

<script>
import DatapointForDisplayInner from "./DatapointForDisplayInner.vue";

export default {
  name: "SuperRecordTreeModeChild",
  components: {DatapointForDisplayInner},
  props: {
    relationTree: {type: Object, required: true},
    data: {type: Object, default: () => ({})},
  },
  computed: {
    treeNodes() {
      return this.buildTreeNodes(this.relationTree, this.data);
    },
  },
  methods: {
    deleteItem(e) {
      this.$emit('deleteItem', e);
    },
    editItem(e) {
      this.$emit('editItem', e);
    },
    buildTreeNodes(relationTree, data) {
      const nodes = [];

      relationTree.headers.forEach((header) => {
        if (header.usageType === "normal") {
          nodes.push({
            id: header.name,
            label: header.label,
            type: "attr",
            value: data[header.field] || "-",
          });
        } else if (
            header.usageType.startsWith("relLookup") &&
            header.meta.relation === "BelongsTo"
        ) {
          nodes.push({
            id: header.name,
            label: `${header.label}`,
            type: "parent",
            value: data[header.field]?.[header.meta.lookupDisplayField] || "-",
            children: header.children
                ? this.buildTreeNodes(header.children, data[header.field] || {})
                : [],
          });
        } else if (
            header.usageType.startsWith("relChildren") &&
            header.meta.relation === "HasMany"
        ) {
          nodes.push({
            id: header.name,
            label: `${header.label}`,
            type: "childGroup",
            children: (data[header.field] || []).map((childData, index) => ({
              id: `${header.name}-${index}`,
              label: `Child ${index + 1}`,
              value: childData[header.meta.displayField] || "-",
              children: header.children
                  ? this.buildTreeNodes(header.children, childData)
                  : [],
            })),
          });
        } else if (
            header.usageType === 'actions'
        ) {
          // Process attributes
          nodes.push({
            id: header.name,
            label: header.label,
            type: "actions",
            // value: data[header.field] || "-",
            header: header,
            relationTree: relationTree,
            data: data,
          });
        }
      });

      return nodes;
    },
    onNodeSelected(node) {
      console.log("Selected node:", node);
    },
  },
};
</script>
