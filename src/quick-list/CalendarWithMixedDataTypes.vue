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
        ref="superTableRefs"
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
    // Check if the model has start and end date fields relevant to the calendar view
    this.dataTypes.forEach((dataType, index) => {
      const modelFields = dataType.model.fields || {}; // Assuming the model has fields defined
      const hasCalendarFields = this.checkForCalendarFields(modelFields);

      if (hasCalendarFields) {
        // Activate and fetch data for relevant models
        this.activateAndFetchData(index);
      }
    });
  },
  methods: {
    // Check if the model has relevant start/end date fields
    checkForCalendarFields(fields) {

      const hasStartDate = Object.values(fields).some(field => field.usageType === 'timeRangeStart');
      const hasEndDate = Object.values(fields).some(field => field.usageType === 'timeRangeEnd');
      return hasStartDate && hasEndDate;
    },
    // Activate and fetch data for a specific SuperTable
    activateAndFetchData(index) {
      const superTable = this.$refs.superTableRefs[index];
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
