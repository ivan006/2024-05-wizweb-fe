<template>
  <div>
    <!-- Loop through the dataTypes and create a hidden SuperTable for each model -->
    <div v-for="(dataType, index) in dataTypes" :key="index" style="display: none;">
      <SuperTable
          :model="dataType.model"
          :parentKeyValuePair="dataType.parentKeyValuePair"
          :templateListGrid="dataType.templateListGrid"
          :isForSelectingRelation="true"
          @clickRow="dataType.clickRow"
          :ref="getSuperTableRefKey(index)"
      />
    </div>
  </div>
</template>

<script>
import SuperTable from './SuperTable.vue'; // Adjust path as needed

export default {
  name: 'CalendarWithMixedDataTypes',
  components: {
    SuperTable,
  },
  props: {
    dataTypes: {
      type: Array,
      required: true, // An array of objects, each containing model, clickRow, parentKeyValuePair, and templateListGrid
    },
  },
  mounted() {
    // After mounting, check if each SuperTable's model has relevant calendar fields
    this.dataTypes.forEach((dataType, index) => {
      this.$nextTick(() => {
        const superTableRefKey = this.getSuperTableRefKey(index);
        const superTable = this.$refs[superTableRefKey][0]; // Access the first element in the ref array

        console.log( `superTableRef-${index}`)
        console.log( superTable.superOptions.modelFields)
        if (superTable) {
          const modelFields = superTable.superOptions.modelFields || {};
          const hasCalendarFields = this.checkForCalendarFields(modelFields);

          if (hasCalendarFields) {
            console.log('ddd')
            this.activateAndFetchData(superTableRefKey);
          }
        }
      });
    });
  },
  methods: {
    // Generate dynamic ref keys for each SuperTable
    getSuperTableRefKey(index) {

      return `superTableRef-${index}`;
    },
    // Check if the SuperTable's model has relevant start and end date fields
    checkForCalendarFields(fields) {
      const hasStartDate = Object.values(fields).some(field => field.usageType === 'timeRangeStart');
      const hasEndDate = Object.values(fields).some(field => field.usageType === 'timeRangeEnd');
      return hasStartDate && hasEndDate;
    },
    // Activate and fetch data for a specific SuperTable by ref key
    activateAndFetchData(refKey) {
      const superTable = this.$refs[refKey][0]; // Access the first element in the ref array
      if (superTable) {
        superTable.activateAndFetchData();
      }
    },
  },
};
</script>

<style scoped>
/* No need for visible styles since SuperTable components are hidden */
</style>
