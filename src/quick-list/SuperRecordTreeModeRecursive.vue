<template>
  <div>
    <div
        v-for="header in headersTree"
        :key="header.name"
        class="q-mb-lg q-pa-sm"
        style="padding-left: 1.5rem; padding-right: 1.5rem;"
    >
      <!-- Handle Attribute Headers -->
      <div v-if="header.usageType === 'normal'" class="q-mb-md">
        <span class="text-bold">{{ header.label }}:</span>
        <span>{{ data[header.field] || '-' }}</span>
      </div>

      <!-- Handle Parent Relations -->
      <q-expansion-item
          v-else-if="header.usageType.startsWith('relLookup') && header.meta.relation === 'BelongsTo'"
          :label="header.label"
          :expanded.sync="true"
          :dense="true"
          class="q-mb-lg q-pa-sm"
          style="padding-left: 1.5rem; padding-right: 1.5rem;"
      >
        <template v-slot:default>
          <SuperRecordTreeModeRecursive
              :headers-tree="header.children || []"
              :data="data[header.field] || {}"
          />
        </template>
      </q-expansion-item>

      <!-- Handle Child Relations -->
      <q-expansion-item
          v-else-if="header.usageType.startsWith('relChildren') && header.meta.relation === 'HasMany'"
          :label="header.label"
          :expanded.sync="true"
          :dense="true"
          class="q-mb-lg q-pa-sm"
          style="padding-left: 1.5rem; padding-right: 1.5rem;"
      >
        <template v-slot:default>
          <div
              v-for="childData in data[header.field] || []"
              :key="childData.id || Math.random()"
          >
            <SuperRecordTreeModeRecursive
                :headers-tree="header.children || []"
                :data="childData"
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
    headersTree: { type: Array, required: true },
    data: { type: Object, default: () => ({}) },
  },
};
</script>
