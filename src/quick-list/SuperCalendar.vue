<template>
  <div>
    <template v-if="loading">
      <div class="text-center q-pa-md">Loading...</div>
    </template>
    <div :style="`display: ${loading ? 'none' : 'block'};`">


      <div class="row ">
        <!--justify-center-->
        <q-btn-toggle
            class=" q-mb-sm block"
            v-model="calendarMode"
            toggle-color="primary"
            :options="[
              {label: 'Timeline', value: 'Timeline'},
              {label: 'List', value: 'List'},
            ]"
            unelevated
            text-color="grey-8"
            color="grey-3"
        />
        <!--q-ml-sm-->
        <!--style="margin-bottom: 20px;"-->
        <div class="q-mb-sm q-ml-sm">
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
      <q-card class="q-pa-none" style="width: 800px; max-width: calc(100vw - 32px);">
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
import {QuickListsHelpers} from "../index";

export default {
  name: "SuperCalendar",
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
    // calendarMode: {
    //   type: String,
    //   // default: "Timeline",
    //   default: "List",
    // },
    mixedConfigs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      // calendarMode: "Timeline",
      calendarMode: "List",
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

    firstNonIdKeys() {
      const keys = {};

      this.mixedConfigs.forEach((config, index) => {
        let key = Object.keys(config.superOptions.headers).find(
            (field) => config.superOptions.headers[field].name !== "id"
        );
        let result = config.superOptions.headers[key].name;

        let timeRangeStartField = config.superOptions.headers.find((field) => {
          return field.usageType == "timeRangeStart";
        });

        if (!timeRangeStartField) {
          for (const modelField of config.superOptions.headers) {
            if (modelField.headerParentFields) {
              const timeRangeStartFieldParent = modelField.headerParentFields.find(
                  (field) => field.usageType == "timeRangeStart"
              );

              if (timeRangeStartFieldParent) {
                const parentHeaders = QuickListsHelpers.SupaerTableHeaders(
                    modelField.meta.relatedModel,
                    [],
                    [],
                    []
                );

                const parentKey = Object.keys(parentHeaders).find(
                    (field) => parentHeaders[field].name !== "id"
                );
                result = [modelField.name, parentHeaders[parentKey].name];
              }
            }
          }
        }

        // Assign to the `keys` object with the index of the config as the key
        keys[index] = result;
      });

      return keys;
    },
    combinedEvents() {
      const eventsArray = []; // Array to hold all combined events

      // Iterate through each config in mixedConfigs
      this.mixedConfigs.forEach((config, configIndex) => {
        // Get the firstNonIdKey for the current config
        const firstNonIdKey = this.firstNonIdKeys[configIndex];

        // Iterate through each item in the config's items array
        config.items.forEach((item) => {
          let start, end;
          // Extract start and end dates, handling nested fields if needed


          const startSplit = config.startFieldName.split(".");
          const endSplit = config.endFieldName.split(".");
          if (startSplit.length > 1) {
            start = new Date(item[startSplit[0]][startSplit[1]]);
            end = new Date(item[endSplit[0]][endSplit[1]]);
          } else {
            start = new Date(item[startSplit[0]]);
            end = new Date(item[startSplit[0]]);
          }

          // Normalize event data
          const eventDate = start.toISOString().split("T")[0]; // YYYY-MM-DD format
          const time = start.toISOString().substr(11, 5); // HH:mm format
          const duration = Math.max((end - start) / 1000 / 60, 15);

          // Determine the event title
          const title = Array.isArray(firstNonIdKey)
              ? item[firstNonIdKey[0]][firstNonIdKey[1]]
              : item[firstNonIdKey] || "Untitled Event";

          // Create the event object
          const event = {
            id: item.id || `${eventDate}-${configIndex}-${title}`, // Unique identifier
            title: title,
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
