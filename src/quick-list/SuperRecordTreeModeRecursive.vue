<template>
  <q-expansion-item
      :label="headers[0]?.label || 'Record'"
      :expanded.sync="true"
      :dense="true"
  >
    <template v-slot:default>
      <!-- Render attributes -->
      <div v-for="header in filteredAttributes" :key="header.name" class="custom-attr">
        <span>{{ header.label }}: </span>
        <span>{{ data[header.field] }}</span>
      </div>

      <!-- Render parent relationships -->
      <div
          v-for="header in parentRelationships"
          :key="header.name"
          class="custom-parent"
      >
        <span>{{ header.label }}:</span>
        <SuperRecordTreeModeRecursive
            v-if="data[header.field]"
            :headers="header.children || []"
            :data="data[header.field]"
        />
      </div>

      <!-- Render child relationships -->
      <q-expansion-item
          v-for="header in childRelationships"
          :key="header.name"
          :label="header.label"
          :dense="true"
      >
        <template v-slot:default>
          <div v-for="child in data[header.field] || []" :key="child.id">
            <SuperRecordTreeModeRecursive
                :headers="header.children || []"
                :data="child"
            />
          </div>
        </template>
      </q-expansion-item>
    </template>
  </q-expansion-item>
</template>

<script>
export default {
  name: "SuperRecordTreeModeRecursive",
  props: {
    headers: {type: Array, required: true},
    data: {type: Object, required: true},
  },
  computed: {
    filteredAttributes() {
      return this.headers.filter(header => header.usageType === "normal");
    },
    parentRelationships() {
      return this.headers.filter(header => header.usageType.startsWith("relLookup"));
    },
    childRelationships() {
      return this.headers.filter(header => header.usageType.startsWith("relChildren"));
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
