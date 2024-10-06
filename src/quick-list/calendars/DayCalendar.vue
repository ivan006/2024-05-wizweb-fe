<script setup>

import {QCalendarDay} from "@quasar/quasar-ui-qcalendar";
</script>

<template>

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
            v-for="event in getEvents(timestamp.date)"
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

<style scoped>

</style>