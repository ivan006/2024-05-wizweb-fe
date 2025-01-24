<template>
  <div>
    <template v-if="loading">
      <div class="text-center q-pa-md">Loading...</div>
    </template>
    <div :style="`display: ${loading ? 'none' : 'block'};`">
      <div class="row items-center wrap q-pb-sm">
        <!--justify-center-->
        <!--<div>-->
        <!--  Time Grid-->
        <!--</div>-->
        <q-toggle
            label="Time Grid"
            v-model="calendarMode"
            toggle-color="primary"
            false-value="List"
            true-value="Timeline"
            unelevated
            text-color="grey-8"
        />
        <!--<q-btn-toggle-->
        <!--    label="dddd"-->
        <!--    class=" block"-->
        <!--    v-model="calendarMode"-->
        <!--    toggle-color="primary"-->
        <!--    :options="[-->
        <!--      // {label: 'Timeline Calendar', value: 'Timeline'},-->
        <!--      // {label: 'List Calendar', value: 'List'},-->
        <!--      // {label: 'Per Hour Calendar', value: 'Timeline'},-->
        <!--      // {label: 'Per Day Calendar', value: 'List'},-->
        <!--      // {label: 'Hour by Hour', value: 'Timeline'},-->
        <!--      // {label: 'Day by Day', value: 'List'},-->
        <!--      {label: 'Time Grid', value: 'Timeline'},-->
        <!--      {label: 'No Grid', value: 'List'},-->
        <!--    ]"-->
        <!--    unelevated-->
        <!--    text-color="grey-8"-->
        <!--    color="grey-3"-->
        <!--/>-->
        <!--q-ml-sm-->
        <!--style="margin-bottom: 20px;"-->
        <!--<div class="q-mb-sm q-ml-sm">-->
        <div class="q-ml-md">
          <CalendarNavigationBar
              @today="onToday"
              @prev="onPrev"
              @next="onNext"
          />
        </div>
      </div>
      <div style="display: flex; max-width: 100%; width: 100%">
        <!-- Render a single calendar containing all events from the combined configs -->
        <template v-if="calendarMode === 'Timeline'">
          <SuperTableCalendarDay
              ref="calendar"
              :events="combinedEvents"
              :mixedConfigs="mixedConfigs"
              v-model="selectedDate"
              :view="view"
              @show-event="onShowEvent"
              @edit-item="onEditItem"
              @delete-item="onDeleteItem"
          />
        </template>
        <template v-else>
          <SuperTableCalendarAgenda
              ref="calendarAgenda"
              :events="combinedEvents"
              :mixedConfigs="mixedConfigs"
              v-model="selectedDate"
              :view="view"
              @show-event="onShowEvent"
              @edit-item="onEditItem"
              @delete-item="onDeleteItem"
          />
        </template>
      </div>
    </div>

    <q-dialog v-model="viewItemData.showModal" max-width="800px">
      <q-card
          class="q-pa-none"
          style="width: 700px; max-width: calc(100vw - 32px)"
      >

        <OverviewTab
            :genericMaxFields="6"
            :item="viewItemData.data"
            :superOptions="activeItemAndType.superOptions"
            :templateOverview="activeItemAndType.templateListGrid"
            @editItem="
              (e) => {
                $emit('editItem', e, this.viewItemData.configIndex);
              }
            "
            @deleteItem="
              (e) => {
                $emit('deleteItem', e, this.viewItemData.configIndex);
              }
            "
            @clickRow="
              (e) => {
                $emit('clickRow', null, e, this.viewItemData.configIndex);
              }
            "
            :unClickable="activeItemAndType.unClickable"
        />
      </q-card>
    </q-dialog>
  </div>
</template>

<script>

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend Day.js with required plugins
dayjs.extend(utc);
dayjs.extend(timezone);

import SuperTableCalendarDay from "./SuperTableCalendarDay.vue";
import SuperTableCalendarAgenda from "./SuperTableCalendarAgenda.vue";
import CalendarNavigationBar from "./CalendarNavigationBar.vue";
import { QuickListsHelpers } from "../index";
import OverviewTab from "./OverviewTab.vue";

export default {
  name: "SuperCalendar",
  components: {
    OverviewTab,
    SuperTableCalendarDay,
    SuperTableCalendarAgenda,
    CalendarNavigationBar,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    mixedConfigs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      calendarMode: "List",
      selectedDate: dayjs().format("YYYY-MM-DD"), // Default to today
      view: "week",
      viewItemData: {
        showModal: false,
        data: {},
        configIndex: null,
      },
    };
  },
  computed: {
    activeItemAndType() {
      return this.mixedConfigs[this.viewItemData.configIndex] || {};
    },

    firstNonIdKeys() {
      const keys = {};

      this.mixedConfigs.forEach((config, index) => {
        let key = Object.keys(config.superOptions.headers).find(
            (field) => config.superOptions.headers[field].name !== "id",
        );
        let result = config.superOptions.headers[key].name;

        const timeRangeStartField = config.superOptions.headers.find(
            (field) => field.usageType === "timeRangeStart",
        );

        if (!timeRangeStartField) {
          for (const modelField of config.superOptions.headers) {
            if (modelField.headerParentFields) {
              const timeRangeStartFieldParent =
                  modelField.headerParentFields.find(
                      (field) => field.usageType === "timeRangeStart",
                  );

              if (timeRangeStartFieldParent) {
                const parentHeaders = QuickListsHelpers.SupaerTableHeaders(
                    modelField.meta.relatedModel,
                    [],
                    [],
                    [],
                );

                const parentKey = Object.keys(parentHeaders).find(
                    (field) => parentHeaders[field].name !== "id",
                );
                result = [modelField.name, parentHeaders[parentKey].name];
              }
            }
          }
        }

        keys[index] = result;
      });

      return keys;
    },

    combinedEvents() {
      const eventsArray = [];

      this.mixedConfigs.forEach((config, configIndex) => {
        const firstNonIdKey = this.firstNonIdKeys[configIndex];

        config.items.forEach((item) => {
          let start, end;

          const startSplit = config.startFieldName.split(".");
          const endSplit = config.endFieldName.split(".");
          if (startSplit.length > 1) {
            start = dayjs(item[startSplit[0]][startSplit[1]]);
            end = dayjs(item[endSplit[0]][endSplit[1]]);
          } else {
            start = dayjs(item[startSplit[0]]);
            end = dayjs(item[endSplit[0]]);
          }

          const eventDate = start.format("YYYY-MM-DD");
          const time = start.format("HH:mm");
          const actualDuration = end.diff(start, "minute");

          const duration = Math.max(actualDuration, 15);

          const title = Array.isArray(firstNonIdKey)
              ? item[firstNonIdKey[0]][firstNonIdKey[1]]
              : item[firstNonIdKey] || "Untitled Event";

          const event = {
            id: item.id || `${eventDate}-${configIndex}-${title}`,
            title: title,
            date: eventDate,
            time: time,
            duration: duration,
            bgcolor: "deep-purple",
            icon: "fas fa-calendar-alt",
            meta: item,
            configIndex: configIndex,
          };

          eventsArray.push(event);
        });
      });
      return eventsArray;
    },
  },
  methods: {
    onShowEvent(event) {
      this.viewItemData = {
        showModal: true,
        data: event.meta,
        configIndex: event.configIndex,
      };
    },

    onEditItem(event) {
      this.activeItemAndType.events.editItem(event.meta);
    },

    onDeleteItem(event) {
      this.activeItemAndType.events.deleteItem(event.meta);
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
    if (window.innerWidth < 768) {
      this.view = "day";
    }
  },
};

</script>
