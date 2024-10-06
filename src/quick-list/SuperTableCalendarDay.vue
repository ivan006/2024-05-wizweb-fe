<template>
  <q-calendar-day
      ref="calendar"
      :modelValue="modelValue"
      @update:modelValue="
      (e) => {
        $emit('update:modelValue', e);
      }
    "
      :view="view"
      short-weekday-label
      :date-header="'stacked'"
      :weekday-align="'center'"
      :date-align="'center'"
      bordered
      :interval-height="20"
      :interval-start="5"
      :interval-count="19"
      hour24-format
      :weekdays="[1, 2, 3, 4, 5, 6, 0]"
      no-active-date
  >
    <!--style=" height: 467px;"-->
    <template #head-day="{ scope }">
      <div class="text-center">
        <div class="text-weight-bold q-mt-xs">
          {{ momentMethod(scope.timestamp.date, "ddd") }}
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
        <div class="day-view-current-time-indicator" :style="style"/>
        <div class="day-view-current-time-line" :style="style"/>
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
        <template v-for="event in getEvents(timestamp.date)" :key="event.id">
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
            <div class="title q-calendar__ellipsis">{{ event.title }}</div>
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
            <q-tooltip>{{ event.time + " - " + event.title }}</q-tooltip>
          </q-badge>
        </template>
      </div>
    </template>

    <template
        #day-body="{ scope: { timestamp, timeStartPos, timeDurationHeight } }"
    >
      <template v-for="event in getEvents(timestamp.date)" :key="event.id">
        <div
            @click="showEvent(event)"
            v-if="event.time !== undefined"
            class="my-event"
            :class="badgeClasses(event, 'body')"
            :style="badgeStyles(event, 'body', timeStartPos, timeDurationHeight)"
        >
          <div class="title q-calendar__ellipsis">{{ event.title }}</div>
        </div>
      </template>
    </template>
  </q-calendar-day>
</template>

<script>
import moment from "moment";
import {parseDate} from "@quasar/quasar-ui-qcalendar";

export default {
  props: {
    events: Array,
    modelValue: String,
    view: String,
  },
  data() {
    return {
      currentDate: null,
      currentTime: null,
      timeStartPos: 0,
    };
  },
  computed:{
    style() {
      return {
        top: this.timeStartPos + "px",
      };
    },
  },
  methods: {
    moveToToday() {
      this.$refs.calendar.moveToToday();
    },
    prev() {
      console.log(111);
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    momentMethod(e, format) {
      return moment(e).format(format);
    },
    isToday(date) {
      return moment(date).isSame(moment(), "day");
    },
    getEvents(date) {
      return this.events[date] || [];
    },
    showEvent(event) {
      this.$emit("show-event", event);
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
    hasDate(days) {
      console.log(this.currentDate)
      return this.currentDate
          ? days.find((day) => day.date === this.currentDate)
          : false;
    },

    // hasDate(days) {
    //   return days.some((day) => day.date === this.selectedDate);
    // },
    adjustCurrentTime() {
      const now = parseDate(new Date());
      this.currentDate = now.date;
      this.currentTime = now.time;
      this.timeStartPos = this.$refs.calendar.timeStartPos(
          this.currentTime,
          false,
      );
      console.log(this.timeStartPos)
    },
  },
  mounted(){

    this.adjustCurrentTime();
    // now, adjust the time every minute
    const intervalId = setInterval(() => {
      this.adjustCurrentTime();
    }, 60000);
  },

  watch: {
    // loading(newVal, oldVal) {
    //   if (!newVal) {
    //     if (this.calendarMode === "Hour by Hour") {
    //       this.adjustCurrentTime();
    //       // now, adjust the time every minute
    //       const intervalId = setInterval(() => {
    //         this.adjustCurrentTime();
    //       }, 60000);
    //     }
    //   }
    // },
    // calendarMode(newVal, oldVal) {
    //   if (this.calendarMode !== "Hour by Hour") {
    //     this.adjustCurrentTime();
    //     // now, adjust the time every minute
    //     const intervalId = setInterval(() => {
    //       this.adjustCurrentTime();
    //     }, 60000);
    //   }
    // },
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
