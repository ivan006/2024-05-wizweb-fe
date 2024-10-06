<template>
  <div>
    <template v-if="loading">
      <div class="text-center q-pa-md">Loading...</div>
    </template>
    <div :style="`display: ${loading ? 'none' : 'block'};`">
      <div style="display: flex; max-width: 100%; width: 100%">
        <!-- Render a single calendar containing all events from the combined configs -->
        <template v-if="calendarMode === 'Hour by Hour'">
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

      <div class="row justify-center">
        <div class="q-pa-md q-gutter-sm row">
          <CalendarNavigationBar
              @today="onToday"
              @prev="onPrev"
              @next="onNext"
          />
        </div>
      </div>
    </div>

    <q-dialog v-model="viewItemData.showModal" max-width="800px">
      <q-card class="q-pa-none">
        <template
            v-if="
            getCurrentSelectedConfig().templateListGrid &&
            getCurrentSelectedConfig().templateListGrid.cols
          "
        >
          <RecordFieldsForDisplayCustom
              :item="viewItemData.data"
              :maxFields="6"
              :childRelations="[]"
              isSummary
              :superOptions="getCurrentSelectedConfig().superOptions"
              :template="getCurrentSelectedConfig().templateListGrid"
              @editItem="getCurrentSelectedConfig().events.editItem"
              @deleteItem="getCurrentSelectedConfig().events.deleteItem"
              :unClickable="getCurrentSelectedConfig().unClickable"
              @clickRow="getCurrentSelectedConfig().events.clickRow"
          />
        </template>
        <template v-else>
          <RecordFieldsForDisplayGeneric
              :item="viewItemData.data"
              :maxFields="6"
              :superOptions="getCurrentSelectedConfig().superOptions"
              @editItem="getCurrentSelectedConfig().events.editItem"
              @deleteItem="getCurrentSelectedConfig().events.deleteItem"
              :unClickable="getCurrentSelectedConfig().unClickable"
              @clickRow="getCurrentSelectedConfig().events.clickRow"
          />
        </template>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import SuperTableCalendarDay from "./SuperTableCalendarDay.vue";
import SuperTableCalendarAgenda from "./SuperTableCalendarAgenda.vue";
import CalendarNavigationBar from "./CalendarNavigationBar.vue";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import moment from "moment";

export default {
  name: "SuperTableCalendar",
  components: {
    SuperTableCalendarDay,
    SuperTableCalendarAgenda,
    CalendarNavigationBar,
    RecordFieldsForDisplayCustom,
    RecordFieldsForDisplayGeneric,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    calendarMode: {
      type: String,
      default: "Full Details",
    },
    mixedConfigs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      selectedDate: moment().format("YYYY-MM-DD"), // Default to today
      view: "week",
      viewItemData: {
        showModal: false,
        data: {},
        configForeignKey: null,
      },
    };
  },
  computed: {
    combinedEvents() {
      const eventsArray = []; // Array to hold all combined events

      // Iterate through each config in mixedConfigs
      this.mixedConfigs.forEach((config, configIndex) => {
        // Iterate through each item in the config's items array
        config.items.forEach((item) => {
          let start, end;

          // Extract start and end dates, handling nested fields if needed
          if (config.startFieldName.isChildOf) {
            const startSplit = config.startFieldName.name.split(".");
            start = new Date(item[startSplit[0]][startSplit[1]]);
            const endSplit = config.endFieldName.name.split(".");
            end = new Date(item[endSplit[0]][endSplit[1]]);
          } else {
            start = new Date(item[config.startFieldName.name]);
            end = new Date(item[config.endFieldName.name]);
          }

          // Normalize event data
          const eventDate = start.toISOString().split("T")[0]; // YYYY-MM-DD format
          const time = start.toISOString().substr(11, 5); // HH:mm format
          const duration = (end - start) / 1000 / 60; // Duration in minutes

          // Create the event object
          const event = {
            id: item.id || `${eventDate}-${configIndex}-${item.title}`, // Unique identifier
            title: Array.isArray(config.firstNonIdKey)
                ? item[config.firstNonIdKey[0]][config.firstNonIdKey[1]]
                : item[config.firstNonIdKey] || "Untitled Event",
            date: eventDate,
            time: time,
            duration: duration,
            bgcolor: "deep-purple", // Placeholder color
            icon: "fas fa-calendar-alt", // Placeholder icon
            meta: item, // Full item data as metadata
            configForeignKey: configIndex, // Store config index for later reference
          };

          // Push event into the eventsArray
          eventsArray.push(event);
        });
      });

      return eventsArray;
    },
  },
  methods: {
    // Get the config for the currently selected item
    getCurrentSelectedConfig() {
      return this.mixedConfigs[this.viewItemData.configForeignKey] || {};
    },

    // Generates events based on items, startFieldName, and endFieldName in the config

    // Handle event interaction
    onShowEvent(event) {
      this.viewItemData = {
        showModal: true,
        data: event.meta,
        configForeignKey: event.configForeignKey,
      };
    },

    onEditItem(event) {
      this.getCurrentSelectedConfig().events.editItem(event.meta);
    },

    onDeleteItem(event) {
      this.getCurrentSelectedConfig().events.deleteItem(event.meta);
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
    // Example of a mobile-first check
    if (window.innerWidth < 768) {
      this.view = "day";
    }
  },
};
</script>
