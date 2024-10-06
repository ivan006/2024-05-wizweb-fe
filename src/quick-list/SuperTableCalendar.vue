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

      <div style="display: flex; max-width: 100%; width: 100%">
        <!-- Toggle Button to switch views -->

        <template v-if="calendarMode === 'Hour by Hour'">
          <q-calendar-day
              ref="calendar"
              v-model="selectedDate"
              :view="view"
              short-weekday-label
              :date-header="'stacked'"
              :weekday-align="'center'"
              :date-align="'center'"
              animated
              bordered
              :interval-height="20"
              :interval-start="5"
              :interval-count="19"
              hour24-format
              :weekdays="[1, 2, 3, 4, 5, 6, 0]"
              no-active-date
          >
            <template #head-day="{ scope }">
              <div class="text-center">
                <!-- Weekday Label -->
                <div class="text-weight-bold q-mt-xs">
                  {{ momentMethod(scope.timestamp.date, "ddd") }}
                  {{}}
                </div>

                <!-- Date as Button -->

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
                    momentMethod(scope.timestamp.date, 'D') +
                    ' ' +
                    momentMethod(scope.timestamp.date, 'MMM')
                  "
                    @click="onClickDate(scope.timestamp.date)"
                    class="q-mb-sm text-bold"
                />
              </div>
            </template>

            <template #day-container="{ scope: { days } }">
              <template v-if="hasDate(days)">
                <div class="day-view-current-time-indicator" :style="style" />
                <div class="day-view-current-time-line" :style="style" />
              </template>
            </template>

            <template #head-day-event="{ scope: { timestamp } }">
              <div
                  style="
                  display: flex;
                  justify-content: center;
                  flex-wrap: wrap;
                  padding: 2px;
                "
              >
                <template
                    v-for="event in eventsMap[timestamp.date]"
                    :key="event.id"
                >
                  <q-badge
                      v-if="!event.time"
                      :class="badgeClasses(event, 'header')"
                      :style="badgeStyles(event, 'header')"
                      style="
                      width: 100%;
                      cursor: pointer;
                      height: 12px;
                      font-size: 10px;
                      margin: 1px;
                    "
                  >
                    <div class="title q-calendar__ellipsis">
                      {{ event.title }}
                      <q-tooltip>{{ event.title }}</q-tooltip>
                    </div>
                  </q-badge>
                  <q-badge
                      v-else
                      :class="badgeClasses(event, 'header')"
                      :style="badgeStyles(event, 'header')"
                      style="
                      margin: 1px;
                      width: 10px;
                      max-width: 10px;
                      height: 10px;
                      max-height: 10px;
                      cursor: pointer;
                    "
                      @click="showEvent(event)"
                  >
                    <!--@click="scrollToEvent(event)"-->
                    <q-tooltip>{{
                        event.time + " - " + event.title
                      }}</q-tooltip>
                  </q-badge>
                </template>
              </div>
            </template>

            <template
                #day-body="{
                scope: { timestamp, timeStartPos, timeDurationHeight },
              }"
            >
              <template
                  v-for="event in getEvents(timestamp.date)"
                  :key="event.id"
              >
                <div
                    @click="showEvent(event)"
                    v-if="event.time !== undefined"
                    class="my-event"
                    :class="badgeClasses(event, 'body')"
                    :style="
                    badgeStyles(event, 'body', timeStartPos, timeDurationHeight)
                  "
                >
                  <div class="title q-calendar__ellipsis">
                    {{ event.title }}
                    <q-tooltip>{{ event.time }}</q-tooltip>
                  </div>
                </div>
              </template>
            </template>
          </q-calendar-day>
        </template>
        <template v-else>
          <q-calendar-agenda
              ref="calendarAgenda"
              v-model="selectedDate"
              :view="view"
              :weekdays="[1, 2, 3, 4, 5, 6, 0]"
              short-weekday-label
              :date-header="'stacked'"
              :weekday-align="'center'"
              :date-align="'center'"
              animated
              bordered
              :interval-height="40"
              :interval-start="5"
              :interval-count="19"
              hour24-format
          >
            <!-- Custom Day Header to show both weekday and month -->
            <template #head-day="{ scope }">
              <div class="text-center">
                <!-- Weekday Label -->
                <div class="text-weight-bold q-mt-xs">
                  {{ momentMethod(scope.timestamp.date, "ddd") }}
                </div>

                <!-- Date as Button -->

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
                    momentMethod(scope.timestamp.date, 'D') +
                    ' ' +
                    momentMethod(scope.timestamp.date, 'MMM')
                  "
                    @click="onClickDate(scope.timestamp.date)"
                    class="q-mb-sm text-bold"
                />
              </div>
            </template>

            <template
                #day="{ scope: { timestamp, timeStartPos, timeDurationHeight } }"
            >
              <template v-if="!getEvents(timestamp.date).length">
                <div class="text-center q-pa-md text-grey-5">Empty</div>
              </template>
              <template
                  v-for="event in getEvents(timestamp.date)"
                  :key="event.id"
              >
                <q-card class="q-pa-none q-ma-sm" @click="showEvent(event)">
                  <template
                      v-if="templateListCalendar && templateListCalendar.cols"
                  >
                    <RecordFieldsForDisplayCustom
                        :item="event.meta"
                        :maxFields="6"
                        :childRelations="[]"
                        isSummary
                        :superOptions="superOptions"
                        :template="templateListCalendar"
                        @editItem="editItem"
                        @deleteItem="deleteItem"
                        :unClickable="
                        unClickable ||
                        !superOptions.model.rules.readable(viewItemData.data)
                      "
                    />
                    <!--@clickRow="clickRow"-->
                  </template>
                  <template v-else>
                    <RecordFieldsForDisplayGeneric
                        :item="event.meta"
                        :maxFields="6"
                        :superOptions="superOptions"
                        @editItem="editItem"
                        @deleteItem="deleteItem"
                        :unClickable="unClickable"
                    />

                    <!--@clickRow="clickRow"-->
                  </template>
                </q-card>
              </template>
            </template>
          </q-calendar-agenda>
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

export default {
  name: "SuperTableCalendar",
  components: {
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
      currentDate: null,
      currentTime: null,
      timeStartPos: 0,
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
      let result = [];
      if (this.startFieldName?.name || this.startFieldName?.isChildOf) {
        for (const item of this.items) {
          let start, end;

          // Check if start and end fields are nested in a related model
          if (this.startFieldName.isChildOf) {
            const startSplit = this.startFieldName.name.split(".");
            start = new Date(item[startSplit[0]][startSplit[1]]);

            const endSplit = this.endFieldName.name.split(".");
            end = new Date(item[endSplit[0]][endSplit[1]]);
          } else {
            start = new Date(item[this.startFieldName.name]);
            end = new Date(item[this.endFieldName.name]);
          }

          let title = "";
          if (Array.isArray(this.firstNonIdKey)) {
            title = item[this.firstNonIdKey[0]][this.firstNonIdKey[1]];
          } else {
            title = item[this.firstNonIdKey];
          }

          // Calculate duration in minutes
          const duration = (end - start) / 1000 / 60;

          // Extract the start time in HH:mm format
          const time = start.toISOString().substr(11, 5);

          result.push({
            id: title, // Assuming this is a unique identifier
            title: title,
            // details: 'Event details',  // Replace with actual details if available
            date: start.toISOString().substr(0, 10), // YYYY-MM-DD format
            time: time,
            duration: duration,
            bgcolor: "deep-purple",
            icon: "fas fa-calendar-alt", // Generic icon
            meta: item,
          });
        }
      }
      return result;
    },

    style() {
      return {
        top: this.timeStartPos + "px",
      };
    },

    eventsMap() {
      const map = {};
      // this.events.forEach(event => (map[ event.date ] = map[ event.date ] || []).push(event))
      this.events.forEach((event) => {
        if (!map[event.date]) {
          map[event.date] = [];
        }
        map[event.date].push(event);
        if (event.days) {
          let timestamp = parseTimestamp(event.date);
          let days = event.days;
          do {
            timestamp = addToDate(timestamp, { day: 1 });
            if (!map[timestamp.date]) {
              map[timestamp.date] = [];
            }
            map[timestamp.date].push(event);
          } while (--days > 0);
        }
      });
      return map;
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

    hasDate(days) {
      return this.currentDate
          ? days.find((day) => day.date === this.currentDate)
          : false;
    },
    adjustCurrentTime() {
      const now = parseDate(new Date());
      this.currentDate = now.date;
      this.currentTime = now.time;
      this.timeStartPos = this.$refs.calendar.timeStartPos(
          this.currentTime,
          false,
      );
    },

    badgeClasses(event, type) {
      const isHeader = type === "header";
      return {
        [`text-white bg-${event.bgcolor}`]: true,
        "full-width": !isHeader && (!event.side || event.side === "full"),
        "left-side": !isHeader && event.side === "left",
        "right-side": !isHeader && event.side === "right",
        "rounded-border": true,
      };
    },

    badgeStyles(
        event,
        type,
        timeStartPos = undefined,
        timeDurationHeight = undefined,
    ) {
      const s = {};
      if (timeStartPos && timeDurationHeight) {
        s.top = timeStartPos(event.time) + "px";
        s.height = timeDurationHeight(event.duration) + "px";
      }
      s["align-items"] = "flex-start";
      return s;
    },

    getEvents(dt) {
      // Get all events for the specified date
      const events = this.eventsMap[dt] || [];

      // Sort events by start time
      events.sort((a, b) => {
        const startA = new Date(`${a.date}T${a.time}`);
        const startB = new Date(`${b.date}T${b.time}`);
        return startA - startB;
      });

      if (events.length === 1) {
        events[0].side = "full";
      } else if (events.length === 2) {
        // Handle up to 2 events per day for overlapping cases
        const startTime = addToDate(parsed(events[0].date), {
          minute: parseTime(events[0].time),
        });
        const endTime = addToDate(startTime, { minute: events[0].duration });
        const startTime2 = addToDate(parsed(events[1].date), {
          minute: parseTime(events[1].time),
        });
        const endTime2 = addToDate(startTime2, { minute: events[1].duration });

        if (
            isBetweenDates(startTime2, startTime, endTime, true) ||
            isBetweenDates(endTime2, startTime, endTime, true)
        ) {
          events[0].side = "left";
          events[1].side = "right";
        } else {
          events[0].side = "full";
          events[1].side = "full";
        }
      }

      return events;
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
  watch: {
    loading(newVal, oldVal) {
      if (!newVal) {
        if (this.calendarMode === "Hour by Hour") {
          this.adjustCurrentTime();
          // now, adjust the time every minute
          const intervalId = setInterval(() => {
            this.adjustCurrentTime();
          }, 60000);
        }
      }
    },
    calendarMode(newVal, oldVal) {
      if (this.calendarMode !== "Hour by Hour") {
        this.adjustCurrentTime();
        // now, adjust the time every minute
        const intervalId = setInterval(() => {
          this.adjustCurrentTime();
        }, 60000);
      }
    },
  },
};
</script>

<style style lang="sass">
.day-cell
  cursor: pointer





.day-view-current-time-indicator
  position: absolute
  left: -5px
  height: 10px
  width: 10px
  margin-top: -4px
  background-color: rgba(0, 0, 255, .5)
  border-radius: 50%

.day-view-current-time-line
  position: absolute
  left: 5px
  border-top: rgba(0, 0, 255, .5) 2px solid
  width: calc(100% - 5px)

.q-dark,
.body--dark,
.q-calendar--dark
  .day-view-current-time-indicator
    background-color: rgba(255, 255, 0, .85)

  .day-view-current-time-line
    border-top: rgba(255, 255, 0, .85) 2px solid





.my-event
  position: absolute
  font-size: 12px
  justify-content: center
  margin: 0 1px
  text-overflow: ellipsis
  overflow: hidden
  cursor: pointer

.title
  position: relative
  display: flex
  justify-content: center
  align-items: center
  height: 100%

.text-white
  color: white

.bg-blue
  background: blue

.bg-green
  background: green

.bg-orange
  background: orange

.bg-red
  background: red

.bg-teal
  background: teal

.bg-grey
  background: grey

.bg-purple
  background: purple

.full-width
  left: 0
  width: calc(100% - 2px)

.left-side
  left: 0
  width: calc(50% - 3px)

.right-side
  left: 50%
  width: calc(50% - 3px)

.rounded-border
  border-radius: 2px
</style>
