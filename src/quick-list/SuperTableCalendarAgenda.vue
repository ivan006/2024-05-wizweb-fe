<template>
  <q-calendar-agenda
      ref="calendar"
      :model-value="modelValue"
      @update:modelValue="(e) => $emit('update:modelValue', e)"
      :view="view"
      :weekdays="[1, 2, 3, 4, 5, 6, 0]"
      short-weekday-label
      :date-header="'stacked'"
      :weekday-align="'center'"
      :date-align="'center'"
      bordered
      :interval-height="40"
      :interval-start="5"
      :interval-count="19"
      hour24-format
  >
    <template #head-day="{ scope }">
      <div class="text-center">
        <div class="text-weight-bold q-mt-xs">
          {{ dayjsMethod(scope.timestamp.date, "ddd") }}
        </div>
        <q-btn
            flat
            rounded
            dense
            :style="
            isToday(scope.timestamp.date)
              ? 'border: solid 2px var(--q-primary);'
              : 'border: solid 2px rgba(0,0,0,0);'
          "
            style="font-size: 0.75em"
            :label="
            dayjsMethod(scope.timestamp.date, 'D') +
            ' ' +
            dayjsMethod(scope.timestamp.date, 'MMM')
          "
            @click="onClickDate(scope.timestamp.date)"
            class="q-mb-sm text-bold"
        />
      </div>
    </template>

    <template #day="{ scope: { timestamp } }">
      <template v-if="!getEvents(timestamp.date).length">
        <div class="text-center q-pa-md text-grey-5">None</div>
      </template>
      <template v-for="event in getEvents(timestamp.date)" :key="event.id">
        <q-card class="q-pa-none q-ma-sm" @click="showEvent(event)">


          <OverviewTab
              :genericMaxFields="6"
              :item="event.meta"
              :superOptions="getCurrentSuperOptions(event.configIndex)"
              :templateOverview="getCurrentTemplate(event.configIndex)"
              @fetchData="fetchData"
              :unClickable="getCurrentUnClickable(event.configIndex)"
          />
          <!--@clickRow="clickRow"-->
        </q-card>
      </template>
    </template>
  </q-calendar-agenda>
</template>

<script>
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";


dayjs.extend(localizedFormat);


import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import OverviewTab from "./OverviewTab.vue";

export default {
  components: {
    OverviewTab,
    RecordFieldsForDisplayGeneric,
    RecordFieldsForDisplayCustom,
  },
  props: {
    events: Array, // Now expecting an array of combined events
    modelValue: String,
    view: String,
    mixedConfigs: Array, // Config array for dynamic behavior
  },
  methods: {
    fetchData(e) {
      this.$emit("fetchData", e);
    },
    moveToToday() {
      this.$refs.calendar.moveToToday();
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    dayjsMethod(date, format) {
      return dayjs(date).format(format);
    },
    isToday(date) {
      return dayjs(date).isSame(dayjs(), "day");
    },
    getEvents(date) {
      // Return all events for the specific date or an empty array if none exist
      return this.events.filter((event) => event.date === date);
    },
    showEvent(event) {
      this.$emit("show-event", event);
    },
    editItem(item) {
      const config = this.getCurrentConfig(item.configIndex);
      config.events.editItem(item);
    },
    deleteItem(item) {
      const config = this.getCurrentConfig(item.configIndex);
      config.events.deleteItem(item);
    },
    getCurrentConfig(configIndex) {
      return this.mixedConfigs[configIndex];
    },
    getCurrentTemplate(configIndex) {
      const config = this.getCurrentConfig(configIndex);
      return config.templateListCalendar || {};
    },
    getCurrentSuperOptions(configIndex) {
      const config = this.getCurrentConfig(configIndex);
      return config.superOptions || {};
    },
    getCurrentUnClickable(configIndex) {
      const config = this.getCurrentConfig(configIndex);
      return config.unClickable || false;
    },
  },
};

</script>
