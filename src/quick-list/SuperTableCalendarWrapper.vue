<template>
<div>dd
  <SuperTableCalendar
      :mixedItems="formattedItems"
      :loading="loading"
      :calendarMode="calendarMode"
      :dataTypes="dataTypes"
  />
</div>
</template>

<script>
import SuperTableCalendar from './SuperTableCalendar.vue';
import Helpers from "../utils/Helpers"; // Assuming you have a helper function for extracting fields

export default {
  name: 'SuperTableCalendarWrapper',
  components: {
    SuperTableCalendar,
  },
  props: {
    startFieldName: String,
    endFieldName: String,
    items: {
      type: Array,
      default: () => [],
    },
    calendarMode: String,
    loading: Boolean,
    templateListGrid: Object,
    templateListCalendar: Object,
    superOptions: Object,
    unClickable: Boolean,
    dataTypes: {
      type: Array,
      default: () => [],
    },
    clickRow: Function,
    editItem: Function,
    deleteItem: Function,
  },
  computed: {
    formattedItems() {
      return this.items.map(item => {
        // Extract start and end time using the helper that checks for parent fields if necessary
        const startField = Helpers.getFieldFromModelOrParent(this.superOptions.modelFields, this.startFieldName);
        const endField = Helpers.getFieldFromModelOrParent(this.superOptions.modelFields, this.endFieldName);

        return {
          dataType: this.superOptions.model.name,
          startTime: this.getValueFromItem(item, startField),
          endTime: this.getValueFromItem(item, endField),
          content: item, // Rest of the content goes here
        };
      });
    },
    dataTypes() {
      return [
        {
          model: this.superOptions.model,
          clickRow: this.clickRow,
          templateListCalendar: this.templateListCalendar,
          superOptions: this.superOptions,
          parentKeyValuePair: {}, // Pass in the parent key value pair if needed
        },
      ];
    },
  },
  methods: {
    getValueFromItem(item, fieldPath) {
      if (!fieldPath) return null;
      const fieldSegments = fieldPath.split('.');
      return fieldSegments.reduce((acc, segment) => acc && acc[segment], item);
    },
  },
};
</script>
