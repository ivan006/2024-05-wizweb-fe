<script setup>

import RecordFieldsForDisplayGeneric from "../RecordFieldsForDisplayGeneric.vue";
import RecordFieldsForDisplayCustom from "../RecordFieldsForDisplayCustom.vue";
</script>

<template>

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

<style scoped>

</style>