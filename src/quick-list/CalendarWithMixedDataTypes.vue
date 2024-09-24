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
        console.log( superTable.superOptions.headers)
        if (superTable) {
          const headers = superTable.superOptions.headers || {};
          const hasCalendarFields = this.checkForCalendarFields(headers);

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

    // Check if the SuperTable's model has relevant start and end date fields, including parent fields
    checkForCalendarFields(fields) {
      let hasStartDate = false;
      let hasEndDate = false;

      // First, check the model fields for timeRangeStart and timeRangeEnd
      Object.values(fields).forEach(field => {
        console.log(field)
        if (field.usageType === 'timeRangeStart') {
          hasStartDate = true;
        }
        if (field.usageType === 'timeRangeEnd') {
          hasEndDate = true;
        }

        // If the field has parent fields, check those as well
        if (field.headerParentFields) {
          field.headerParentFields.forEach(parentField => {
            if (parentField.usageType === 'timeRangeStart') {
              hasStartDate = true;
            }
            if (parentField.usageType === 'timeRangeEnd') {
              hasEndDate = true;
            }
          });
        }
      });

      // Return true only if both start and end date fields are found
      return hasStartDate && hasEndDate;
    },

    // Activate and fetch data for a specific SuperTable by ref key
    activateAndFetchData(refKey) {
      const superTable = this.$refs[refKey][0]; // Access the first element in the ref array
      if (superTable) {
        superTable.activateAndFetchData();
      }
    },
  }

};
</script>

<style scoped>
/* No need for visible styles since SuperTable components are hidden */
</style>
