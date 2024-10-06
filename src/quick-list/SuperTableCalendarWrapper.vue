<template>
  <div>
    <SuperTableCalendar
        :loading="loading"
        :calendarMode="calendarMode"
        :mixedConfigs="normalizedConfigs"
    />
  </div>
</template>

<script>
import SuperTableCalendar from './SuperTableCalendar.vue'; // Path assumed to be correct

export default {
  name: 'SuperTableCalendarWrapper',
  components: {
    SuperTableCalendar,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    startFieldName: {
      type: Object,
      required: true,
    },
    endFieldName: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    calendarMode: {
      type: String,
      default: 'Full Details',
    },
    templateListCalendar: {
      type: Object,
      default: () => ({}),
    },
    unClickable: {
      type: Boolean,
      default: false,
    },
    superOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    normalizedConfigs() {
      // Return an array of configurations (poly-content), even for mono-content setups
      return [
        {
          templateListCalendar: this.templateListCalendar,
          startFieldName: this.startFieldName,
          endFieldName: this.endFieldName,
          items: this.items,
          superOptions: this.superOptions,
          unClickable: this.unClickable,
          // Include the event methods as part of the config
          events: {
            clickRow: this.clickRow,
            editItem: this.editItem,
            deleteItem: this.deleteItem,
          }
        }
      ];
    },
  },
  methods: {
    // Events will be included in each config
    clickRow(itemId, item) {
      this.$emit('clickRow', itemId, item);
    },
    editItem(item) {
      this.$emit('editItem', item);
    },
    deleteItem(item) {
      this.$emit('deleteItem', item);
    },
  },
};
</script>
