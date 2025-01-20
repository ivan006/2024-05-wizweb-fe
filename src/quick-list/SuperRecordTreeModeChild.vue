<template>
  <q-tree
      :nodes="treeNodes"
      node-key="id"
      @update:selected="onNodeSelected"
  >
    <template v-slot:default-header="prop">
      <div>
        <template v-if="prop.node.type === 'attr'">
          <strong>{{ prop.node.label }}</strong>: {{ prop.node.value }}
        </template>
        <template v-else-if="prop.node.type === 'parent'">
          <strong>{{ prop.node.label }}</strong> (Parent Relation)
        </template>
        <template v-else-if="prop.node.type === 'childGroup'">
          <strong>{{ prop.node.label }}</strong> (Child Relation Group)
        </template>
      </div>
    </template>
  </q-tree>
</template>

<script>
export default {
  name: "SuperRecordTreeModeChild",
  props: {
    headersTree: { type: Array, required: true },
    data: { type: Object, default: () => ({}) },
  },
  computed: {
    treeNodes() {
      return this.buildTreeNodes(this.headersTree, this.data);
    },
  },
  methods: {
    buildTreeNodes(headersTree, data) {
      const nodes = [];

      headersTree.forEach((header) => {
        if (header.usageType === "normal") {
          // Process attributes
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
          // Process parent relations
          nodes.push({
            id: header.name,
            label: header.label,
            type: "parent",
            children: this.buildTreeNodes(
                header.children || [],
                data[header.field] || {}
            ),
          });
        } else if (
            header.usageType.startsWith("relChildren") &&
            header.meta.relation === "HasMany"
        ) {
          // Process child relations
          nodes.push({
            id: header.name,
            label: header.label,
            type: "childGroup",
            children: (data[header.field] || []).map((childData, index) => ({
              id: `${header.name}-${index}`,
              label: `Child ${index + 1}`,
              children: this.buildTreeNodes(header.children || [], childData),
            })),
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
