<template>
  <div>
    <div v-if="!allLoaded">
      <!-- Spinner or loading indicator -->
      <p>Loading...</p>
    </div>
    <SuperTableCalendar
        v-if="allLoaded && configsFetched"
        :loading="!allLoaded"
        :mixedConfigs="mergedConfigs"
        :calendarMode="calendarMode"
    />
    <!-- Hidden SuperTable for each model -->
    <div
        v-for="(dataType, index) in dataTypes"
        :key="index"
        style="display: none"
    >
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
import SuperTable from "./SuperTable.vue"; // Adjust path as needed
import SuperTableCalendar from "./SuperTableCalendar.vue";
import {Helpers} from "../index"; // Adjust path as needed

export default {
  name: "CalendarWithMixedDataTypes",
  components: {
    SuperTable,
    SuperTableCalendar,
  },
  props: {
    dataTypes: {
      type: Array,
      required: true, // An array of objects, each containing model, clickRow, parentKeyValuePair, and templateListGrid
    },
    calendarMode: {
      type: String,
      // default: "Full Details",
      default: "Hour by Hour",
    },
  },
  data() {
    return {
      loadingStatus: {},
      mergedData: [], // Holds the merged data from all SuperTables
      configsFetched: false, // Holds the merged data from all SuperTables
    };
  },
  computed: {
    allLoaded() {
      // Check if all models have completed loading
      return Object.values(this.loadingStatus).every(
          (status) => status === true,
      );
    },
    mergedConfigs() {
      return this.dataTypes.map((dataType, configIndex) => {
        const superTable = this.$refs[this.getSuperTableRefKey(configIndex)]?.[0];
        const superOptions = superTable?.superOptions || {};

        // Access inferred start and end fields from the computed array
        const { startFieldName, endFieldName } = this.startAndEndFieldNames[configIndex] || {};

        return {
          templateListCalendar: dataType.templateListCalendar,
          startFieldName: startFieldName,
          endFieldName: endFieldName,
          items: this.mergedData[dataType.model.name],
          superOptions: superOptions, // Use inferred superOptions
          // unClickable: dataType.unClickable,
          unClickable: false,
          events: {
            // clickRow: dataType.clickRow,
            // editItem: dataType.editItem,
            // deleteItem: dataType.deleteItem,
            clickRow: ()=>{},
            editItem: ()=>{},
            deleteItem: ()=>{},
          }
        };
      });
    },


    startAndEndFieldNames() {
      return this.dataTypes.map((dataType, index) => {
        const superTable = this.$refs[this.getSuperTableRefKey(index)]?.[0]; // Access SuperTable instance

        if (!superTable) return { startFieldName: null, endFieldName: null };

        const headers = superTable.superOptions.headers || {};

        // Use the getFieldFromModelOrParent method to extract the field names
        const startFieldName = Helpers.getFieldFromModelOrParent(headers, 'timeRangeStart');
        const endFieldName = Helpers.getFieldFromModelOrParent(headers, 'timeRangeEnd');

        return { startFieldName, endFieldName };
      });
    },
  },
  mounted() {
    // After mounting, check if each SuperTable's model has relevant calendar fields and fetch data
    this.dataTypes.forEach((dataType, index) => {
      this.$nextTick(() => {
        this.configsFetched = true
        const refKey = this.getSuperTableRefKey(index);
        const superTable = this.$refs[refKey][0]; // Access the first element in the ref array

        this.loadingStatus[dataType.model.name] = false;

        if (superTable) {
          const headers = superTable.superOptions.headers || {};
          const hasCalendarFields = this.checkForCalendarFields(headers);
          if (hasCalendarFields) {
            superTable.activateAndFetchData();
          } else {
            this.loadingStatus[dataType.model.name] = true;
          }
        }
      });
    });
  },
  methods: {

    // getFieldFromModelOrParent(fields, usageType) {
    //   let targetField = null;
    //
    //   targetField = Object.values(fields).find(
    //       (field) => field.usageType === usageType
    //   );
    //   if (targetField) {
    //     return targetField.field;
    //   }
    //
    //   Object.values(fields).forEach((field) => {
    //     if (field.headerParentFields) {
    //       const parentField = field.headerParentFields.find(
    //           (parent) => parent.usageType === usageType
    //       );
    //       if (parentField) {
    //         targetField = parentField.name;
    //       }
    //     }
    //   });
    //
    //   return targetField;
    // },

    handleDataFetched(modelName, items) {
      // Find the dataType that corresponds to the modelName
      const dataType = this.dataTypes.find((dt) => dt.model.name === modelName);

      // Access the SuperTable ref to infer superOptions
      const superTable =
          this.$refs[
              this.getSuperTableRefKey(this.dataTypes.indexOf(dataType))
              ]?.[0];

      // Ensure superTable and its superOptions are available
      if (!superTable || !superTable.superOptions) return;

      // Get the headers (fields) for the current model from the SuperTable's superOptions
      const headers = superTable.superOptions.headers || {};

      // Process and normalize fetched data
      const processedItems = items.map((item) => {
        return item;
      });

      // Store the normalized data for this model under its model name
      // this.$set(this.mergedData, modelName, processedItems);
      this.mergedData[modelName] = processedItems

      // Mark this model as done fetching
      this.loadingStatus[modelName] = true;

      // Check if all data is fetched
      if (this.allLoaded) {
        console.log("All data fetched:", this.mergedData);
      }
    },
    getValueFromItem(item, fieldPath) {
      if (!fieldPath) return null;
      const fieldParts = fieldPath.split(".");
      const value = fieldParts.reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : null;
      }, item);

      return value;
    },
    checkForCalendarFields(fields) {
      const hasStartDateField = Helpers.getFieldFromModelOrParent(
          fields,
          "timeRangeStart",
      );
      const hasEndDateField = Helpers.getFieldFromModelOrParent(
          fields,
          "timeRangeEnd",
      );

      return hasStartDateField && hasEndDateField;
    },
    getSuperTableRefKey(index) {
      return `superTableRef-${index}`;
    },
  },
};
</script>

<style scoped>
/* No need for visible styles since SuperTable components are hidden */
</style>
