<template>
  <q-expansion-item
      :label="treeStructure.label"
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
        <SuperRecordTreeModeRecursive
            v-if="data[parent.field]"
            :headers="parent.structure"
            :data="data[parent.field]"
            :relationships="parent.relations"
            :active="false"
        />
      </div>

      <!-- Children -->
      <q-expansion-item
          v-for="child in treeStructure.children"
          :key="child.label"
          :label="child.label"
          :expanded.sync="child.expanded"
          :dense="true"
      >
        <template v-slot:default>
          <SuperRecordTreeModeRecursive
              :headers="child.structure"
              :data="data[child.field]"
              :relationships="child.relations"
              :active="false"
          />
        </template>
      </q-expansion-item>
    </template>
  </q-expansion-item>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";

export default {
  name: "SuperRecordTreeModeRecursive",
  props: {
    headers: { type: Array, required: true },
    data: { type: Object, required: true },
    relationships: { type: Array, default: () => [] },
    active: { type: Boolean, default: false },
  },
  computed: {
    treeStructure() {
      const attrs = this.headers
          .filter(header => !header.usageType.startsWith("relChildren") && !header.usageType.startsWith("relLookup"))
          .map(header => ({
            type: "attr",
            label: header.label,
            field: header.field,
          }));

      const parents = this.headers
          .filter(header => header.usageType.startsWith("relLookup"))
          .map(header => ({
            label: header.label,
            field: header.field,
            structure: QuickListsHelpers.SupaerTableHeaders(header.meta.relatedModel),
            relations: header.meta.relatedModel ? QuickListsHelpers.SupaerTableHeaders(header.meta.relatedModel) : [],
          }));

      const children = this.relationships.map(relation => ({
        label: relation.label || relation.name,
        field: relation.name,
        structure: QuickListsHelpers.SupaerTableHeaders(relation.meta.relatedModel),
        relations: relation.children || [],
      }));

      return {
        label: "Record", // Adjust if needed
        attrs,
        parents,
        children,
      };
    },
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
</style>
