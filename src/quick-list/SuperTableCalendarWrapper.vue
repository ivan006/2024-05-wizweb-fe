<template>
  <div>
    <SuperTableCalendar
        :items="formattedItems"
        :startFieldName="startFieldName"
        :endFieldName="endFieldName"
        :loading="loading"
        :calendarMode="calendarMode"
        :templateListCalendar="templateListCalendar"
        :unClickable="unClickable"
        :superOptions="superOptions"
        @clickRow="clickRow"
        @editItem="editItem"
        @deleteItem="deleteItem"
    />
  </div>
</template>

<script>
import SuperTableCalendar from './SuperTableCalendar.vue'; // Assuming the path is correct

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
    formattedItems() {
      // Any preprocessing on items if needed, or directly return
      return this.items;
    },
  },
  methods: {
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
