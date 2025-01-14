<template>
  <q-expansion-item
      :label="headers[0]?.label || 'Record'"
      :expanded.sync="true"
      :dense="true"
  >
    <template v-slot:default>
      <!-- Render attributes -->
      <div
          v-for="header in filteredAttributes"
          :key="header.name"
          class="q-mb-md q-flex q-items-center"
          style="gap: 1rem;"
      >
        <span class="text-bold" style="width: 30%;">{{ header.label }}:</span>
        <span style="width: 70%;">{{ data[header.field] }}</span>
      </div>

      <!-- Render parent relationships -->
      <div
          v-for="header in parentRelationships"
          :key="header.name"
          class="q-mb-md q-flex q-items-start"
          style="gap: 1rem;"
      >
        <span class="text-bold" style="width: 30%;">{{ header.label }}:</span>
        <div style="width: 70%; padding-left: 1rem;">
          <SuperRecordTreeModeRecursive
              v-if="data[header.field]"
              :headers="header.children || []"
              :data="data[header.field]"
          />
        </div>
      </div>

      <!-- Render child relationships -->
      <q-expansion-item
          v-for="header in childRelationships"
          :key="header.name"
          :label="header.label"
          :dense="true"
          class="q-mb-md"
      >
        <template v-slot:default>
          <div
              v-for="(child, index) in data[header.field]"
              :key="index"
              class="q-mb-md"
          >
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
    headers: { type: Array, default: () => [] },
    data: { type: Object, default: () => ({}) },
  },
  computed: {
    filteredAttributes() {
      return this.headers.filter(
          (header) => header.usageType.startsWith("normal")
      );
    },
    parentRelationships() {
      return this.headers.filter((header) =>
          header.usageType.startsWith("relLookup")
      );
    },
    childRelationships() {
      return this.headers.filter((header) =>
          header.usageType.startsWith("relChildren")
      );
    },
  },
};
</script>
