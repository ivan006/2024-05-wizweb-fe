<template>
  <q-expansion-item
      :label="headers[0]?.label || 'Record'"
      :expanded.sync="true"
      :dense="true"
      expand-icon="keyboard_arrow_right"
      expand-icon-expanded="keyboard_arrow_down"
  >
    <template v-slot:header>
      <div class="q-flex q-items-center" style="gap: 0.5rem;">
        <q-icon
            :name="expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
            class="cursor-pointer"
            @click.stop="toggleExpand"
        />
        <span class="text-bold">{{ headers[0]?.label || 'Record' }}</span>
      </div>
    </template>

    <template v-slot:default>
      <!-- Render attributes -->
      <div
          v-for="header in filteredAttributes"
          :key="header.name"
          class="q-py-md q-flex q-items-center"
          style="gap: 1rem;"
      >
        <span class="text-bold" style="width: 30%;">{{ header.label }}:</span>
        <span style="width: 70%;">{{ data[header.field] }}</span>
      </div>

      <!-- Render parent relationships -->
      <div
          v-for="header in parentRelationships"
          :key="header.name"
          class="q-py-md q-flex q-items-start"
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
          class="q-py-md"
          :expanded.sync="true"
          expand-icon="keyboard_arrow_right"
          expand-icon-expanded="keyboard_arrow_down"
      >
        <template v-slot:header>
          <div class="q-flex q-items-center" style="gap: 0.5rem;">
            <q-icon
                :name="expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
                class="cursor-pointer"
                @click.stop="toggleExpand"
            />
            <span class="text-bold">{{ header.label }}</span>
          </div>
        </template>

        <template v-slot:default>
          <SuperRecordTreeModeRecursive
              v-if="data[header.field]"
              :headers="header.children || []"
              :data="data[header.field]"
          />
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
  data() {
    return {
      expanded: true,
    };
  },
  computed: {
    filteredAttributes() {
      return this.headers.filter(
          (header) =>
              !header.usageType.startsWith("relLookup") &&
              !header.usageType.startsWith("relChildren")
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
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    },
  },
};
</script>
