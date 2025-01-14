<template>
  <div>
    <!-- Render attributes -->
    <div
        v-for="header in filteredAttributes"
        :key="header.name"
        class="q-mb-md q-pa-sm"
        style="padding-left: 1.5rem; padding-right: 1.5rem;"
    >
      <span class="text-bold">{{ header.label }}:</span>
      <span>{{ data[header.field] || '-' }}</span>
    </div>

    <!-- Render parent relationships -->
    <div v-for="header in parentRelationships" :key="header.name">
      <q-expansion-item
          :label="header.label"
          :expanded.sync="true"
          :dense="true"
          class="q-mb-lg q-pa-sm"
          style="padding-left: 1.5rem; padding-right: 1.5rem;"
      >
        <template v-slot:default>
          <SuperRecordTreeModeRecursive
              :headers="header.children || []"
              :data="data[header.field] || {}"
          />
        </template>
      </q-expansion-item>
    </div>

    <!-- Render child relationships -->
    <div v-for="header in childRelationships" :key="header.name">
      <q-expansion-item
          :label="header.label"
          :expanded.sync="true"
          :dense="true"
          class="q-mb-lg q-pa-sm"
          style="padding-left: 1.5rem; padding-right: 1.5rem;"
      >
        <template v-slot:default>
          <div
              v-for="(child, index) in data[header.field]"
              :key="index"
              class="q-mb-md q-pa-sm"
          >
            <SuperRecordTreeModeRecursive
                :headers="header.children || []"
                :data="child"
            />
          </div>
        </template>
      </q-expansion-item>
    </div>
  </div>
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
