<template>
  <div>
    <!-- Loop through headers -->
    <div v-for="header in headers" :key="header.name" class="q-mb-lg q-pa-sm" style="padding-left: 1.5rem; padding-right: 1.5rem;">
      <!-- Handle Attributes -->
      <div v-if="header.usageType.startsWith('normal')" class="q-mb-md">
        <span class="text-bold">{{ header.label }}:</span>
        <span>{{ data[header.field] || '-' }}</span>
      </div>

      <!-- Handle Parent Relationships -->
      <q-expansion-item
          v-else-if="header.usageType.startsWith('relLookup') && header.meta.relation === 'BelongsTo'"
          :label="header.label"
          :dense="true"
          :expanded.sync="true"
          class="q-mb-md"
          style="padding-left: 1.5rem; padding-right: 1.5rem;"
      >
        <template v-slot:default>
          <SuperRecordTreeModeRecursive
              :headers="header.children"
              :data="data[header.field]"
          />
        </template>
      </q-expansion-item>

      <!-- Handle Child Relationships -->
      <q-expansion-item
          v-else-if="header.usageType.startsWith('relChildren') && header.meta.relation === 'HasMany'"
          :label="header.label"
          :dense="true"
          :expanded.sync="true"
          class="q-mb-md"
          style="padding-left: 1.5rem; padding-right: 1.5rem;"
      >
        <template v-slot:default>
          <div
              v-for="child in data[header.field] || []"
              :key="child.id"
              class="q-mb-md"
              style="padding-left: 1.5rem; padding-right: 1.5rem;"
          >
            <SuperRecordTreeModeRecursive
                :headers="header.children"
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
    headers: { type: Array, required: true },
    data: { type: Object, required: true },
  },
};
</script>
