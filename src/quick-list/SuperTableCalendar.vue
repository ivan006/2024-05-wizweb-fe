<template>
  <div>
    <q-card class="q-pa-none">
      <q-select
          v-model="view"
          :options="views"
          dense
          outlined
          hide-details
          class="q-ma-md"
          label="View"
      ></q-select>

      <q-select
          v-model="mode"
          :options="modes"
          dense
          outlined
          hide-details
          label="Event Overlap Mode"
          class="q-ma-md"
      ></q-select>
    </q-card>

    <q-card class="q-pa-none q-py-md" style="height: 800px;">
      <q-btn flat dense icon="arrow_left" @click="prevPeriod">Prev</q-btn>
      <q-btn flat dense icon="arrow_right" @click="nextPeriod">Next</q-btn>
      <q-calendar
          ref="calendar"
          v-model="selectedDate"
          :weekdays="weekday"
          :view="view"
          :events="events"
          event-overlap-mode="mode"
          event-overlap-threshold="30"
          :event-color="getEventColor"
          @change="updateTimeWindow"
          interval-start="8"
          interval-duration="60"
          intervals="14"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
      >
        <template v-slot:day="{ scope }">
          <div @click="showEvent(scope.date)" class="day-cell">
            {{ scope.day }}
          </div>
        </template>
      </q-calendar>
    </q-card>

    <q-dialog v-model="viewItemData.showModal" max-width="800px">
      <q-card class="q-pt-md">
        <q-card-section>
          <RecordOverview
              :item="viewItemData.data"
              :superOptions="superOptions"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn @click="clickRow(viewItemData.data)" flat label="Open" />
          <q-btn @click="viewItemData.showModal = false" flat label="Cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import QuickListsHelpers from "./QuickListsHelpers";
import RecordOverview from "./RecordOverview.vue";

export default {
  name: "SuperTableCalendar",
  components: {
    RecordOverview,
  },
  props: {
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    superOptions: {
      type: Object,
      default() {
        return {
          headers: [],
          modelFields: [],
          displayMapField: false,
          model: {},
          canEdit: false,
          currentParentRecord: {},
        };
      },
    },
  },
  data: () => ({
    view: "week", // Initialize with a valid view
    views: ["month", "week", "day", "4day"],
    mode: "stack",
    modes: ["stack", "column"],
    weekday: [1, 2, 3, 4, 5, 6, 0],
    weekdays: [
      {title: "Sun - Sat", value: [0, 1, 2, 3, 4, 5, 6]},
      {title: "Mon - Sun", value: [1, 2, 3, 4, 5, 6, 0]},
      {title: "Mon - Fri", value: [1, 2, 3, 4, 5]},
      {title: "Mon, Wed, Fri", value: [1, 3, 5]},
    ],
    selectedDate: new Date().toISOString().split('T')[0], // Initialize with the current date in 'YYYY-MM-DD' format
    colors: [
      "blue",
      "indigo",
      "deep-purple",
      "cyan",
      "green",
      "orange",
      "grey darken-1",
    ],
    viewItemData: {
      showModal: false,
      data: {},
    },
  }),
  computed: {
    firstNonIdKey() {
      const key = Object.keys(this.superOptions.headers).find(
          (field) => this.superOptions.headers[field].value !== "id"
      );
      const result = this.superOptions.headers[key].value;
      return result;
    },
    startFieldName() {
      let timeRangeStartField = this.superOptions.headers.find((field) => {
        return field.usageType == "timeRangeStart";
      });
      if (!timeRangeStartField) {
        for (const modelField of this.superOptions.headers) {
          if (modelField.headerChildren) {
            timeRangeStartField = modelField.headerChildren.find((field) => {
              return field.usageType == "timeRangeStart";
            });
            timeRangeStartField = {
              ...timeRangeStartField,
              isChildOf: modelField,
            };
            break;
          }
        }
      }
      return timeRangeStartField;
    },
    endFieldName() {
      let timeRangeEndField = this.superOptions.headers.find((field) => {
        return field.usageType == "timeRangeEnd";
      });
      if (!timeRangeEndField) {
        for (const modelField of this.superOptions.headers) {
          if (modelField.headerChildren) {
            timeRangeEndField = modelField.headerChildren.find((field) => {
              return field.usageType == "timeRangeEnd";
            });
            timeRangeEndField = {
              ...timeRangeEndField,
              isChildOf: modelField,
            };
            break;
          }
        }
      }
      return timeRangeEndField;
    },
    events() {
      let result = [];
      if (this.startFieldName?.value) {
        for (const item of this.items) {
          if (this.startFieldName.isChildOf) {
            result.push({
              title: item[this.firstNonIdKey],
              start: new Date(
                  item[this.startFieldName.isChildOf.value][
                      this.startFieldName.value
                      ]
              ),
              end: new Date(
                  item[this.startFieldName.isChildOf.value][
                      this.endFieldName.value
                      ]
              ),
              color: "deep-purple",
              timed: true,
              meta: item,
            });
          } else {
            result.push({
              title: item[this.firstNonIdKey],
              start: new Date(item[this.startFieldName.value]),
              end: new Date(item[this.endFieldName.value]),
              color: "deep-purple",
              timed: true,
              meta: item,
            });
          }
        }
      }
      return result;
    },
  },
  methods: {
    clickRow(e) {
      this.viewItemData.showModal = false;
      this.$emit("clickRow", e);
    },
    updateTimeWindow() {
    },
    getEventColor(event) {
      return event.color;
    },
    rnd(a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a;
    },
    showEvent(m) {
      this.viewItemData.showModal = true;
      this.viewItemData.data = m.meta;
    },
    viewDay({date}) {
      this.selectedDate = date;
      this.view = "day";
    },
    prevPeriod() {
      this.$refs.calendar.prev();
    },
    nextPeriod() {
      this.$refs.calendar.next();
    }
  },
  mounted() {
    if (QuickListsHelpers.quickListsIsMobile()) {
      this.view = "day";
    }
  },
};
</script>

<style scoped>
.day-cell {
  cursor: pointer;
}
</style>
