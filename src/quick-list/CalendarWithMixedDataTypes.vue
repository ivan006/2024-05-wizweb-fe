<template>
  <div>
    <pre>{{mergedData}}</pre>
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
  data() {
    return {
      mergedData: [], // Holds the merged data from all SuperTables
    };
  },
  mounted() {
    // After mounting, check if each SuperTable's model has relevant calendar fields and fetch data
    this.dataTypes.forEach((dataType, index) => {
      this.$nextTick(() => {
        const superTableRefKey = this.getSuperTableRefKey(index);
        const superTable = this.$refs[superTableRefKey][0]; // Access the first element in the ref array

        if (superTable) {
          const headers = superTable.superOptions.headers || {};
          const hasCalendarFields = this.checkForCalendarFields(headers);
          console.log('hasCalendarFields')
          console.log(hasCalendarFields)
          if (hasCalendarFields) {
            this.fetchSuperTableData(superTableRefKey);
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

      // Check both fields and parent fields for timeRangeStart and timeRangeEnd
      Object.values(fields).forEach(field => {
        if (field.usageType === 'timeRangeStart') {
          hasStartDate = true;
        }
        if (field.usageType === 'timeRangeEnd') {
          hasEndDate = true;
        }

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

      return hasStartDate && hasEndDate;
    },

    // Fetch data from each SuperTable and merge it once all fetches are complete
    fetchSuperTableData(refKey) {
      const superTable = this.$refs[refKey][0]; // Access the first element in the ref array
      if (superTable) {
        superTable.activateAndFetchData()

        console.log( 'data')
        console.log( superTable.items)
        const items = superTable.items; // Get the fetched data from SuperTable
        this.mergedData = [...this.mergedData, ...items]; // Merge data into the super array
      }
    },


  },
};
</script>

<style scoped>
/* No need for visible styles since SuperTable components are hidden */
</style>
