<template>
  <div>
    <div class="subcontent">
      <CalendarNavigationBar
          @today="onToday"
          @prev="onPrev"
          @next="onNext"
      />

      <!--<div class="q-ma-sm row justify-center">-->
      <!--  <q-select-->
      <!--      v-model="dateHeader"-->
      <!--      label="date-header"-->
      <!--      outlined-->
      <!--      dense-->
      <!--      options-dense-->
      <!--      :options="[-->
      <!--        'stacked',-->
      <!--        'inline',-->
      <!--        'inverted'-->
      <!--      ]"-->
      <!--      class="button"-->
      <!--      style="min-width: 160px;"-->
      <!--  />-->

      <!--  <q-select-->
      <!--      v-model="dateAlign"-->
      <!--      label="date-align"-->
      <!--      outlined-->
      <!--      dense-->
      <!--      options-dense-->
      <!--      :options="[-->
      <!--        'center',-->
      <!--        'left',-->
      <!--        'right'-->
      <!--      ]"-->
      <!--      class="button"-->
      <!--      style="min-width: 160px;"-->
      <!--  />-->

      <!--  <q-select-->
      <!--      v-model="weekdayAlign"-->
      <!--      label="weekday-align"-->
      <!--      outlined-->
      <!--      dense-->
      <!--      options-dense-->
      <!--      :options="[-->
      <!--    'center',-->
      <!--    'left',-->
      <!--    'right'-->
      <!--  ]"-->
      <!--      class="button"-->
      <!--      style="min-width: 160px;"-->
      <!--  />-->
      <!--</div>-->

      <div class="row justify-center">
        <div style="display: flex; max-width: 800px; width: 100%; height: 400px;">
          <q-calendar-day
              ref="calendar"
              v-model="selectedDate"
              view="week"
              short-weekday-label
              :date-header="'stacked'"
              :weekday-align="'center'"
              :date-align="'center'"
              animated
              bordered
              @change="onChange"
              @moved="onMoved"
              @click-date="onClickDate"
              @click-time="onClickTime"
              @click-interval="onClickInterval"
              @click-head-intervals="onClickHeadIntervals"
              @click-head-day="onClickHeadDay"
              :interval-height="30"
              :interval-start="6"
              :interval-count="16"
              hour24-format
          >
            <template #day-container="{ scope: { days }}">
              <template v-if="hasDate(days)">
                <div
                    class="day-view-current-time-indicator"
                    :style="style"
                />
                <div
                    class="day-view-current-time-line"
                    :style="style"
                />
              </template>
            </template>
          </q-calendar-day>
          <!--style="height: 400px; width: 100%;"-->
        </div>
      </div>
    </div>

    <!--<q-card class="q-pa-none">-->
    <!--  <q-select-->
    <!--      v-model="view"-->
    <!--      :options="views"-->
    <!--      dense-->
    <!--      outlined-->
    <!--      hide-details-->
    <!--      class="q-ma-md"-->
    <!--      label="View"-->
    <!--  ></q-select>-->

    <!--  <q-select-->
    <!--      v-model="mode"-->
    <!--      :options="modes"-->
    <!--      dense-->
    <!--      outlined-->
    <!--      hide-details-->
    <!--      label="Event Overlap Mode"-->
    <!--      class="q-ma-md"-->
    <!--  ></q-select>-->
    <!--</q-card>-->

    <!--<q-card class="q-pa-none q-py-md" style="height: 800px;">-->
    <!--  <q-btn flat dense icon="arrow_left" @click="prevPeriod">Prev</q-btn>-->
    <!--  <q-btn flat dense icon="arrow_right" @click="nextPeriod">Next</q-btn>-->
    <!--  <q-calendar-->
    <!--      ref="calendar"-->
    <!--      v-model="selectedDate"-->
    <!--      :weekdays="weekday"-->
    <!--      :view="view"-->
    <!--      :events="events"-->
    <!--      event-overlap-mode="mode"-->
    <!--      event-overlap-threshold="30"-->
    <!--      :event-color="getEventColor"-->
    <!--      @change="updateTimeWindow"-->
    <!--      interval-start="8"-->
    <!--      interval-duration="60"-->
    <!--      intervals="14"-->
    <!--      @click:event="showEvent"-->
    <!--      @click:more="viewDay"-->
    <!--      @click:date="viewDay"-->
    <!--  >-->
    <!--    <template v-slot:day="{ scope }">-->
    <!--      <div @click="showEvent(scope.date)" class="day-cell">-->
    <!--        {{ scope.day }}-->
    <!--      </div>-->
    <!--    </template>-->
    <!--  </q-calendar>-->
    <!--</q-card>-->

    <q-dialog v-model="viewItemData.showModal" max-width="800px">
      <q-card class="q-pt-md">
        <q-card-section>
          <RecordFieldsForDisplayGeneric
              :item="viewItemData.data"
              :superOptions="superOptions"
              @editItem="editItem"
              @deleteItem="deleteItem"
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
import {today, parseDate} from '@quasar/quasar-ui-qcalendar';
import QuickListsHelpers from "./QuickListsHelpers";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import DatapointForDisplayInner from "./DatapointForDisplayInner.vue";
import CalendarNavigationBar from "./CalendarNavigationBar.vue";

export default {
  name: "SuperTableCalendar",
  components: {
    DatapointForDisplayInner,
    RecordFieldsForDisplayGeneric,
    CalendarNavigationBar,
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

    style(){
      return {
        top: this.timeStartPos + 'px'
      }
    }
  },
  methods: {
    deleteItem(e) {
      this.$emit('deleteItem', e);
    },
    editItem(e) {
      this.$emit('editItem', e);
    },
    clickRow(e) {
      this.viewItemData.showModal = false;
      this.$emit("clickRow", e[this.superOptions.model.primaryKey], e);
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
    },




    onToday () {
      this.$refs.calendar.moveToToday()
    },
    onPrev () {
      this.$refs.calendar.prev()
    },
    onNext () {
      this.$refs.calendar.next()
    },

    onMoved (data) {
      console.log('onMoved', data)
    },
    onChange (data) {
      console.log('onChange', data)
    },
    onClickDate (data) {
      console.log('onClickDate', data)
    },
    onClickTime (data) {
      console.log('onClickTime', data)
    },
    onClickInterval (data) {
      console.log('onClickInterval', data)
    },
    onClickHeadIntervals (data) {
      console.log('onClickHeadIntervals', data)
    },
    onClickHeadDay (data) {
      console.log('onClickHeadDay', data)
    },

    hasDate (days) {
      return this.currentDate
          ? days.find(day => day.date === this.currentDate)
          : false
    },
    adjustCurrentTime () {
      const now = parseDate(new Date())
      this.currentDate = now.date
      this.currentTime = now.time
      this.timeStartPos = this.$refs.calendar.timeStartPos(this.currentTime, false)
    }
  },
  mounted() {
    if (QuickListsHelpers.quickListsIsMobile()) {
      this.view = "day";
    }


    this.adjustCurrentTime()
    // now, adjust the time every minute
    const intervalId = setInterval(() => {
      this.adjustCurrentTime()
    }, 60000)
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

</style>

