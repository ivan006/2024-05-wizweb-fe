<template>
  <div>
    <template v-if="loading">
      <div class="text-center q-pa-md">
        <!--<q-spinner  color="primary" />-->
        Loading...
      </div>
    </template>
    <div :style="`display: ${loading ? 'none' : 'block'};`">
      <!--<div :style="`visibility: ${loading ? 'hidden' : 'visible'};`">-->

      <div style="display: flex; max-width: 100%; width: 100%;">
        <!-- Toggle Button to switch views -->

        <template v-if="calendarMode === 'Hour by Hour'">
          <SuperTableCalendarDay
              ref="calendar"
              :events="events"
              v-model="selectedDate"
              :view="view"
              :template-list-calendar="templateListCalendar"
              :super-options="superOptions"
              :un-clickable="unClickable"
              @show-event="showEvent"
              @edit-item="editItem"
              @delete-item="deleteItem"
          />
        </template>
        <template v-else>
          <SuperTableCalendarAgenda
              ref="calendarAgenda"
              :events="events"
              v-model="selectedDate"
              :view="view"
              :template-list-calendar="templateListCalendar"
              :super-options="superOptions"
              :un-clickable="unClickable"
              @show-event="showEvent"
              @edit-item="editItem"
              @delete-item="deleteItem"
          />
        </template>

        <!--style="height: 400px; width: 100%;"-->
      </div>

      <div class="row justify-center">
        <div class="q-pa-md q-gutter-sm row">
          <CalendarNavigationBar
              @today="onToday"
              @prev="onPrev"
              @next="onNext"
          />
          <!--<q-select-->
          <!--    v-model="view"-->
          <!--    :options='[-->
          <!--        // "month",-->
          <!--        {-->
          <!--          label: "Week",-->
          <!--          value: "week",-->
          <!--        },-->
          <!--        {-->
          <!--          label: "Day",-->
          <!--          value: "day",-->
          <!--        },-->
          <!--        // "4day"-->
          <!--    ]'-->
          <!--    option-label="label"-->
          <!--    option-value="value"-->
          <!--    emitValue-->
          <!--    mapOptions-->
          <!--    dense-->
          <!--    filled-->
          <!--    hide-details-->
          <!--    class=""-->
          <!--    label="View"-->
          <!--&gt;</q-select>-->
        </div>
      </div>
    </div>

    <q-dialog v-model="viewItemData.showModal" max-width="800px">
      <q-card class="q-pa-none">
        <template v-if="templateListGrid && templateListGrid.cols">
          <RecordFieldsForDisplayCustom
              :item="viewItemData.data"
              :maxFields="6"
              :childRelations="[]"
              isSummary
              :superOptions="superOptions"
              :template="templateListGrid"
              @editItem="editItem"
              @deleteItem="deleteItem"
              :unClickable="
              unClickable ||
              !superOptions.model.rules.readable(viewItemData.data)
            "
              @clickRow="clickRow"
          />
          <!--<div :class="colClasses(templateListGrid.width ? templateListGrid.width : 3)" >-->
          <!--  <div class="q-card q-mx-auto" style="height: 100%; overflow: hidden;">-->
          <!--  </div>-->
          <!--</div>-->
        </template>
        <template v-else>
          <RecordFieldsForDisplayGeneric
              :item="viewItemData.data"
              :maxFields="6"
              :superOptions="superOptions"
              @editItem="editItem"
              @deleteItem="deleteItem"
              :unClickable="unClickable"
              @clickRow="clickRow"
          />
        </template>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import {
  today,
  parseDate,
  addToDate,
  parseTimestamp,
  isBetweenDates,
  parsed,
  parseTime,
  QCalendarDay,
} from "@quasar/quasar-ui-qcalendar";

import QuickListsHelpers from "./QuickListsHelpers";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import DatapointForDisplayInner from "./DatapointForDisplayInner.vue";
import CalendarNavigationBar from "./CalendarNavigationBar.vue";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import moment from "moment";
import SuperTableCalendarDay from "./SuperTableCalendarDay.vue";
import SuperTableCalendarAgenda from "./SuperTableCalendarAgenda.vue";

export default {
  name: "SuperTableCalendar",
  components: {
    SuperTableCalendarAgenda,
    SuperTableCalendarDay,
    RecordFieldsForDisplayCustom,
    DatapointForDisplayInner,
    RecordFieldsForDisplayGeneric,
    CalendarNavigationBar,
    QCalendarDay,
  },
  props: {
    loading: {
      type: Boolean,
      default() {
        return false;
      },
    },
    templateListGrid: {
      type: Object,
      default() {
        return {};
      },
    },
    startFieldName: {
      type: Object,
      default() {
        return null;
      },
    },
    endFieldName: {
      type: Object,
      default() {
        return null;
      },
    },
    templateListCalendar: {
      type: Object,
      default() {
        return {};
      },
    },
    unClickable: {
      type: Boolean,
      default() {
        return false;
      },
    },
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    calendarMode: {
      type: String,
      default() {
        return "Full Details";
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
  data() {
    return {
      view: "week", // Initialize with a valid view
      mode: "stack",
      modes: ["stack", "column"],
      weekday: [1, 2, 3, 4, 5, 6, 0],
      weekdays: [
        { title: "Sun - Sat", value: [0, 1, 2, 3, 4, 5, 6] },
        { title: "Mon - Sun", value: [1, 2, 3, 4, 5, 6, 0] },
        { title: "Mon - Fri", value: [1, 2, 3, 4, 5] },
        { title: "Mon, Wed, Fri", value: [1, 3, 5] },
      ],
      // selectedDate: new Date().toISOString().split('T')[0], // Initialize with the current date in 'YYYY-MM-DD' format
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

      selectedDate: today(),
      // dateAlign: 'center',
      // weekdayAlign: 'center',
      // dateHeader: 'stacked',
    };
  },
  computed: {
    moment() {
      return moment;
    },
    firstNonIdKey() {
      const key = Object.keys(this.superOptions.headers).find(
          (field) => this.superOptions.headers[field].name !== "id",
      );
      let result = this.superOptions.headers[key].name;

      let timeRangeStartField = this.superOptions.headers.find((field) => {
        return field.usageType == "timeRangeStart";
      });
      if (!timeRangeStartField) {
        for (const modelField of this.superOptions.headers) {
          if (modelField.headerParentFields) {
            const timeRangeStartFieldParent =
                modelField.headerParentFields.find((field) => {
                  return field.usageType == "timeRangeStart";
                });
            if (timeRangeStartFieldParent) {
              const parentHeaders = QuickListsHelpers.SupaerTableHeaders(
                  modelField.meta.relatedModel,
                  [],
                  [],
                  [],
              );

              const key = Object.keys(parentHeaders).find(
                  (field) => parentHeaders[field].name !== "id",
              );
              result = [modelField.name, parentHeaders[key].name];
            }
          }
        }
      }
      return result;
    },

    events() {
      let result = {};
      if (
          this.items.length > 0 &&
          (this.startFieldName?.name || this.startFieldName?.isChildOf)
      ) {
        for (const item of this.items) {
          let start, end;

          // Extract start and end dates, handling nested fields if needed
          if (this.startFieldName.isChildOf) {
            const startSplit = this.startFieldName.name.split(".");
            start = new Date(item[startSplit[0]][startSplit[1]]);
            const endSplit = this.endFieldName.name.split(".");
            end = new Date(item[endSplit[0]][endSplit[1]]);
          } else {
            start = new Date(item[this.startFieldName.name]);
            end = new Date(item[this.endFieldName.name]);
          }

          let title = Array.isArray(this.firstNonIdKey)
              ? item[this.firstNonIdKey[0]][this.firstNonIdKey[1]]
              : item[this.firstNonIdKey];

          // Normalize the event data
          const eventDate = start.toISOString().split("T")[0]; // YYYY-MM-DD format
          const time = start.toISOString().substr(11, 5); // HH:mm format
          const duration = (end - start) / 1000 / 60; // Calculate duration in minutes

          // Push event into the result object under the appropriate date
          if (!result[eventDate]) {
            result[eventDate] = [];
          }

          result[eventDate].push({
            id: title, // Assuming this is a unique identifier
            title: title,
            date: eventDate,
            time: time,
            duration: duration,
            bgcolor: "deep-purple",
            icon: "fas fa-calendar-alt", // Generic icon
            meta: item, // Keep the full item in case more metadata is needed
          });
        }
      }

      return result; // Object where each key is a date and value is an array of events for that date
    },


  },
  methods: {
    isToday(date) {
      return moment(date).isSame(moment(), "day");
    },
    momentMethod(e, format) {
      return moment(e).format(format);
    },
    deleteItem(e) {
      this.$emit("deleteItem", e);
    },
    editItem(e) {
      this.$emit("editItem", e);
    },
    clickRow(e) {
      this.viewItemData.showModal = false;
      this.$emit("clickRow", e[this.superOptions.model.primaryKey], e);
    },
    updateTimeWindow() {},
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



    getEvents(date) {
      // Return all events for the specific date or an empty array if none exist
      return this.events[date] || [];
    },

    onToday() {
      if (this.$refs.calendarAgenda) {
        this.$refs.calendarAgenda.moveToToday();
      } else if (this.$refs.calendar) {
        this.$refs.calendar.moveToToday();
      }
    },
    onPrev() {
      if (this.$refs.calendarAgenda) {
        this.$refs.calendarAgenda.prev();
      } else if (this.$refs.calendar) {
        this.$refs.calendar.prev();
      }
    },
    onNext() {
      if (this.$refs.calendarAgenda) {
        this.$refs.calendarAgenda.next();
      } else if (this.$refs.calendar) {
        this.$refs.calendar.next();
      }
    },
  },
  mounted() {
    if (QuickListsHelpers.quickListsIsMobile()) {
      this.view = "day";
    }
  },
};
</script>

