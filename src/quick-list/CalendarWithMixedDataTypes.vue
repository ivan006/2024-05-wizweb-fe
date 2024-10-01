<template>
  <div>
    <div v-if="!allLoaded">
      <!-- Spinner or loading indicator -->
      <p>Loading...</p>
    </div>
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
          @fetchComplete="handleDataFetched"
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
      loadingStatus: {},
      mergedData: [], // Holds the merged data from all SuperTables
    };
  },
  computed: {
    allLoaded() {
      // Check if all models have completed loading
      return Object.values(this.loadingStatus).every(status => status === true);
    }
  },
  mounted() {
    // After mounting, check if each SuperTable's model has relevant calendar fields and fetch data
    this.dataTypes.forEach((dataType, index) => {
      this.$nextTick(() => {
        const refKey = this.getSuperTableRefKey(index);
        const superTable = this.$refs[refKey][0]; // Access the first element in the ref array

        // Initialize loading status for each model
        // this.$set(this.loadingStatus, dataType.model.name, false);

        this.loadingStatus[dataType.model.name] = false;

        if (superTable) {
          const headers = superTable.superOptions.headers || {};
          const hasCalendarFields = this.checkForCalendarFields(headers);
          if (hasCalendarFields) {
            superTable.activateAndFetchData();
          } else {
            // If the model doesn't have calendar fields, mark it as fetched
            this.loadingStatus[dataType.model.name] = true;
          }
        }
      });
    });
  },

  methods: {
    getFieldFromModelOrParent(fields, usageType) {
      let targetField = null;

      // Check direct fields for the usageType
      targetField = Object.values(fields).find(field => field.usageType === usageType);

      if (targetField) {
        // If found in direct fields, return as a string for direct access
        return `'${targetField.field}'`;
      }

      // If not found, check parent fields
      Object.values(fields).forEach(field => {
        if (field.headerParentFields) {
          const parentField = field.headerParentFields.find(parent => parent.usageType === usageType);
          if (parentField) {
            // Return as a string path 'parentField.field'
            targetField = `"${field.field}.${parentField.field}"`;
          }
        }
      });

      return targetField; // Either the direct field string or the nested field string
    },

    handleDataFetched(modelName, items) {
      // Find the dataType that corresponds to the modelName
      const dataType = this.dataTypes.find(dt => dt.model.name === modelName);

      // Process and normalize fetched data
      const processedItems = items.map(item => {
        // Get the headers (fields) for the current model from the dataType's superOptions
        const headers = this.$refs[this.getSuperTableRefKey(this.dataTypes.indexOf(dataType))][0].superOptions.headers;

        // Extract start and end time, check both direct and parent fields
        const startTimeFieldPath = this.getFieldFromModelOrParent(headers, 'timeRangeStart');
        const endTimeFieldPath = this.getFieldFromModelOrParent(headers, 'timeRangeEnd');

        // Get the actual values from the item using the field paths
        const startTime = this.getValueFromItem(item, startTimeFieldPath);
        const endTime = this.getValueFromItem(item, endTimeFieldPath);

        // Return normalized structure
        return {
          dataType: modelName, // Which data type (model) the item belongs to
          startTime: startTime || null, // Extracted start time
          endTime: endTime || null, // Extracted end time
          content: {
            ...item, // All other attributes of the item
          },
        };
      });

      // Merge normalized data into mergedData
      this.mergedData = [...this.mergedData, ...processedItems];

      // Mark this model as done fetching
      this.loadingStatus[modelName] = true;

      // Check if all data is fetched
      if (this.allLoaded) {
        console.log('All data fetched:', this.mergedData);
      }
    },

    // Utility method to safely access nested values in an item based on path string
    getValueFromItem(item, path) {
      if (!path) return null;

      // Remove quotes and split by dot for nested paths
      const keys = path.replace(/["']/g, "").split(".");

      // Recursively access the value in the item
      return keys.reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : null), item);
    },


    checkForCalendarFields(fields) {
      const hasStartDate = !!Object.values(fields).find(field => this.getFieldFromModelOrParent(field, 'timeRangeStart'));
      const hasEndDate = !!Object.values(fields).find(field => this.getFieldFromModelOrParent(field, 'timeRangeEnd'));
      console.log('hasStartDate')
      console.log(hasStartDate)
      return hasStartDate && hasEndDate;
    },



    // Generate dynamic ref keys for each SuperTable
    getSuperTableRefKey(index) {
      return `superTableRef-${index}`;
    },




  },
};
</script>

<style scoped>
/* No need for visible styles since SuperTable components are hidden */
</style>
