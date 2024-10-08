<template>
  <div>
    <SuperTablePolyContentifiedCalendar
        :loading="loading"
        :mixedConfigs="normalizedConfigs"
    />
    <!--:calendarMode="calendarMode"-->
  </div>
</template>

<script>
import SuperTablePolyContentifiedCalendar from './SuperTablePolyContentifiedCalendar.vue'; // Adjust path as necessary

export default {
  name: 'SuperTableCalendarWrapper',
  components: {
    SuperTablePolyContentifiedCalendar,
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
    // calendarMode: {
    //   type: String,
    //   default: 'List',
    // },
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
      // Return an array of configurations, treating mono-content like poly-content.
      return [
        {
          templateListCalendar: this.templateListCalendar,
          startFieldName: this.startFieldName,
          endFieldName: this.endFieldName,
          items: this.items,
          superOptions: this.superOptions,
          unClickable: this.unClickable,
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
    // Emit relevant events to parent component
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
