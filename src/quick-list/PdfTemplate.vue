<template>
  <div style="" id="pdfContent">
    <!-- Title at the top -->

    <div class="q-ma-xl">


      <template v-if="options.title">
        <div class="col-12 q-mb-lg">
          <div class="text-h6 text-grey-7 text-center">
            {{ options.title }}
          </div>
        </div>
      </template>

      <!-- Quasar Table -->
      <template v-if="!tableRows.length">
        <div class="text-center q-pa-md" style="color: DimGray;">
          No items
        </div>
      </template>
      <q-table
          separator="none"
          :rows="tableRows"
          :columns="tableColumns"
          row-key="key"
          flat
          dense
          :pagination="pagination"
          hide-bottom
      >
        <!-- Table Headers -->
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="table-header"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Table Rows -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="table-cell"
            >
              {{ props.row[col.field] }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import {defineProps, computed, ref, defineAsyncComponent} from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  options: {
    type: {},
    required: true,
  },
});

// Dynamically generate columns based on the first item in the list
const tableColumns = computed(() => {
  if (props.items.length === 0) return [];
  return Object.keys(props.items[0]).map((key) => ({
    name: key,
    align: 'left',
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter for the header
    field: key,
  }));
});

// Convert items array to a format that q-table can consume
const tableRows = computed(() => props.items);

// Disable pagination by setting a large page size
const pagination = ref({
  page: 1,
  rowsPerPage: 0, // Set to 0 to disable pagination and show all rows
});
</script>

<style scoped>
.table-header {
  background-color: rgb(41, 128, 186);
  color: white;
  padding: 8px;
  font-weight: bold;
}

.table-cell {
  padding: 8px;
  background-color: #f5f5f5;
  color: DimGray;
}

.q-table tr:nth-child(even) .table-cell {
  background-color: white;
}

.q-table tr:nth-child(odd) .table-cell {
  background-color: #f5f5f5;
}

.q-table tr:nth-child(even) .table-header {
  background-color: rgb(93, 173, 226); /* Lighter blue for striped effect */
}


</style>
