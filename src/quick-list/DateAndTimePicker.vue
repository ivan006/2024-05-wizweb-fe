<template>
  <div>
    <!-- Initial Text Area Input -->
    <q-input
        label="Select Date Range"
        readonly
        @click="click"
        v-model="formattedValue"
        :error="false"
        :error-message="''"
        dense
        outlined
        :disable="disabled"
        v-slot:append
    >
      <q-icon name="calendar_today" />
    </q-input>

    <!-- The Main Modal -->
    <q-dialog v-model="showDialog" max-width="500px">
      <q-card class="q-pa-md">
        <h3>Select Date & Time</h3>

        <!-- Date -->
        <q-input
            label="Date"
            v-model="formattedDate"
            :error="false"
            :error-message="''"
            readonly
            @click="showDatePicker = true"
            dense
            outlined
        ></q-input>

        <!-- Date Picker Modal -->
        <q-dialog v-model="showDatePicker" max-width="290px">
          <q-card>
            <q-date v-model="selectedDate" @update:modelValue="setDefaultStartTime" />
            <div class="q-pa-md text-right">
              <q-btn color="primary" @click="showDatePicker = false">OK</q-btn>
            </div>
          </q-card>
        </q-dialog>

        <!-- Time -->
        <q-input
            label="Time"
            v-model="formattedTime"
            :error="false"
            :error-message="''"
            readonly
            @click="showTimePicker = true"
            dense
            outlined
        ></q-input>

        <!-- Time Picker Modal -->
        <q-dialog v-model="showTimePicker" max-width="290px">
          <q-card>
            <q-time v-model="selectedTime"></q-time>
            <div class="q-pa-md text-right">
              <q-btn color="primary" @click="showTimePicker = false">OK</q-btn>
            </div>
          </q-card>
        </q-dialog>

        <!-- OK Button -->
        <q-card-actions>
          <q-space></q-space>
          <q-btn color="primary" @click="finalizeDateTime">OK</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import moment from "moment";
import "moment-timezone";

export default {
  name: "DateAndTimePicker",
  props: {
    hideLabel: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    useTimezone: {
      type: Boolean,
      default: false, // Default to false for local time
    },
  },
  data() {
    return {
      showDialog: false,
      showDatePicker: false,
      showTimePicker: false,
      selectedDate: null,
      selectedTime: null,
      selectedTimezone: "Africa/Johannesburg", // default timezone
    };
  },
  computed: {
    formattedValue() {
      if (this.formattedDate && this.formattedTime) {
        return `${this.formattedDate} ${this.formattedTime}${
            this.useTimezone ? ` (${this.selectedTimezone})` : ""
        }`;
      }
      return "";
    },
    formattedDate() {
      return this.selectedDate
          ? this.useTimezone
              ? moment
                  .tz(this.selectedDate, this.selectedTimezone)
                  .format("dddd, MMMM D, YYYY")
              : moment(this.selectedDate).format("dddd, MMMM D, YYYY")
          : "";
    },
    formattedTime() {
      return this.selectedTime
          ? this.useTimezone
              ? moment
                  .tz(this.selectedTime, "HH:mm:ss", this.selectedTimezone)
                  .format("h:mm A")
              : moment(this.selectedTime, "HH:mm:ss").format("h:mm A")
          : "";
    },
  },
  methods: {
    click() {
      if (!this.disabled) {
        this.showDialog = true;
      }
    },
    setDefaultStartTime() {
      const now = this.useTimezone
          ? moment.tz(this.selectedTimezone)
          : moment();

      // Set minutes, seconds, and milliseconds to 0 and add 1 hour
      now.minutes(0).seconds(0).milliseconds(0).add(1, "hours");

      this.selectedTime = now.format("HH:mm:ss");
    },
    parseTimestamptz(value) {
      if (value) {
        const dateTime = this.useTimezone
            ? moment.tz(value, this.selectedTimezone)
            : moment(value);

        this.selectedDate = dateTime.format("YYYY-MM-DD");
        this.selectedTime = dateTime.format("HH:mm:ss");
      }
    },
    getTimestampForDatabase() {
      return this.useTimezone
          ? moment
              .tz(`${this.selectedDate} ${this.selectedTime}`, this.selectedTimezone)
              .toISOString()
          : moment(`${this.selectedDate} ${this.selectedTime}`)
              .format('YYYY-MM-DDTHH:mm:ss.SSS');
    },
    finalizeDateTime() {
      const dateTimeForDB = this.getTimestampForDatabase();
      this.$emit("update:modelValue", dateTimeForDB);
      this.showDialog = false;
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.parseTimestamptz(newVal);
      },
    },
  },
};
</script>

<style scoped></style>
