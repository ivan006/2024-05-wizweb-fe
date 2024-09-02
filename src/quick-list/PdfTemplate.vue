<template>
  <div>
    <div class="col-12 q-mb-lg">
      <div class="text-h6 text-grey-7 text-center">
        {{ title }}
      </div>
    </div>
    <q-table
        separator="none"
        :rows="tableRows"
        :columns="tableColumns"
        row-key="key"
        flat
        dense
        hide-header
        :pagination="pagination"
        hideBottom
    >
      <template v-slot:body-cell-key="props">
        <q-td :props="props" class="table-title" colspan="2">
          {{ props.row.key }}
        </q-td>
      </template>

      <template v-slot:body-cell-value="props">
        <q-td :props="props" class="table-value" colspan="2">
          {{ props.row.value }}
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { defineProps, computed, ref } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

// Convert items array to a format that q-table can consume
const tableRows = computed(() =>
    props.items.map((item) => {
      const rows = [];
      for (const [key, value] of Object.entries(item)) {
        rows.push({
          key,
          value,
        });
      }
      return rows;
    }).flat()
);

// Define the table columns for q-table
const tableColumns = [
  {
    name: 'key',
    align: 'left',
    field: 'key',
  },
  {
    name: 'value',
    align: 'left',
    field: 'value',
  },
];

// Disable pagination by setting a large page size
const pagination = ref({
  page: 1,
  rowsPerPage: 0, // Set to 0 to disable pagination and show all rows
});
</script>

<style scoped>
.table-title {
  background-color: rgb(41, 128, 186);
  color: white;
  padding: 8px;
  font-weight: bold;
}

.table-value {
  padding: 8px;
  background-color: #f5f5f5;
  color: DimGray;
}

.q-table tr:nth-child(even) .table-title {
  background-color: rgb(93, 173, 226); /* Lighter blue for striped effect */
}

.q-table tr:nth-child(odd) .table-value {
  background-color: #f5f5f5; /* Light grey for table values */
}

.q-table tr:nth-child(even) .table-value {
  background-color: white;
}
</style>
