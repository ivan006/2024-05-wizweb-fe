<template>
  <q-page>
    <!-- Initial Text Area Input -->
    <q-input
        label="Select Date Range"
        readonly
        @click="showDialog = true"
        v-model="formattedValue"
        :error="false"
        :error-message="''"
        filled
    >
      <template v-slot:append>
        <q-icon name="event" />
      </template>
    </q-input>

    <!-- The Main Modal -->
    <q-dialog v-model="showDialog" max-width="500px">
      <q-card class="q-pa-md">
        <!-- Start Section -->
        <div>
          <div class="text-h6">Start</div>

          <!-- Start Date -->
          <q-input
              label="Start Date"
              v-model="formattedStartDate"
              :error="false"
              :error-message="''"
              readonly
              @click="showStartDatePicker = true"
              filled
          ></q-input>

          <!-- Start Date Picker Modal -->
          <q-dialog v-model="showStartDatePicker" max-width="290px">
            <q-date
                v-model="startDate"
                @update:modelValue="setDefaultStartTime"
                :error="false"
                :error-message="''"
            ></q-date>
          </q-dialog>

          <!-- Start Time -->
          <q-input
              label="Start Time"
              v-model="formattedStartTime"
              :error="false"
              :error-message="''"
              readonly
              @click="showStartTimePicker = true"
              filled
          ></q-input>

          <!-- Start Time Picker Modal -->
          <q-dialog v-model="showStartTimePicker" max-width="290px">
            <q-time v-model="startTime"></q-time>
          </q-dialog>
        </div>

        <!-- End Section -->
        <div>
          <div class="text-h6">End</div>

          <!-- End Date -->
          <q-input
              label="End Date"
              v-model="formattedEndDate"
              :error="false"
              :error-message="''"
              readonly
              @click="showEndDatePicker = true"
              filled
          ></q-input>

          <!-- End Date Picker Modal -->
          <q-dialog v-model="showEndDatePicker" max-width="290px">
            <q-date v-model="endDate"></q-date>
          </q-dialog>

          <!-- End Time -->
          <q-input
              label="End Time"
              v-model="formattedEndTime"
              :error="false"
              :error-message="''"
              readonly
              @click="showEndTimePicker = true"
              filled
          ></q-input>

          <!-- End Time Picker Modal -->
          <q-dialog v-model="showEndTimePicker" max-width="290px">
            <q-time
                v-model="endTime"
                @update:modelValue="manuallyChangedEndTime"
            ></q-time>
          </q-dialog>
        </div>

        <!-- OK Button -->
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" @click="finalizeDateTimeRange" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import moment from "moment";
import "moment-timezone";

export default {
  name: "DateRangePicker",
  props: {
    hideLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modelValue: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      showDialog: false,
      showStartDatePicker: false,
      showEndDatePicker: false,
      showStartTimePicker: false,
      showEndTimePicker: false,
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      selectedTimezone: "Africa/Johannesburg",
      duration: 120,
    };
  },
  computed: {
    formattedValue() {
      let result = "";
      if (
          this.formattedStartDate &&
          this.formattedStartTime &&
          this.formattedEndTime
      ) {
        if (this.startDate === this.endDate) {
          result = `${this.formattedStartDate} \n${this.formattedStartTime} - ${this.formattedEndTime} (${this.selectedTimezone})`;
        } else {
          result = `${this.formattedStartDate} ${this.formattedStartTime} -\n${this.formattedEndDate} ${this.formattedEndTime} (${this.selectedTimezone})`;
        }
      }
      return result;
    },
    formattedStartDate() {
      return this.startDate
          ? moment
              .tz(this.startDate, this.selectedTimezone)
              .format("dddd, MMMM D, YYYY")
          : "";
    },
    formattedEndDate() {
      return this.endDate
          ? moment
              .tz(this.endDate, this.selectedTimezone)
              .format("dddd, MMMM D, YYYY")
          : "";
    },
    formattedStartTime() {
      return this.startTime
          ? moment
              .tz(this.startTime, "HH:mm:ss", this.selectedTimezone)
              .format("h:mm A")
          : "";
    },
    formattedEndTime() {
      return this.endTime
          ? moment
              .tz(this.endTime, "HH:mm:ss", this.selectedTimezone)
              .format("h:mm A")
          : "";
    },
    dateTimeRange() {
      if (
          this.formattedStartDate &&
          this.formattedStartTime &&
          this.formattedEndTime
      ) {
        return `${this.formattedStartDate} \n ${this.formattedStartTime} - ${this.formattedEndTime} (Africa/Johannesburg)`;
      }
      return null;
    },
    pgDateTimeRange() {
      const startDateTime = moment(
          `${this.startDate} ${this.startTime}`
      ).format("YYYY-MM-DD HH:mm:ssZZ");
      const endDateTime = moment(`${this.endDate} ${this.endTime}`).format(
          "YYYY-MM-DD HH:mm:ssZZ"
      );
      return `"[${startDateTime},${endDateTime}]"`;
    },
  },
  methods: {
    parseTstzrange(value) {
      const matches = value.match(/\[(.*?),(.*)\]/);
      if (matches) {
        const startDateTime = moment.tz(matches[1], this.selectedTimezone);
        const endDateTime = moment.tz(matches[2], this.selectedTimezone);

        this.detectDuration(
            startDateTime.format("HH:mm:ss"),
            endDateTime.format("HH:mm:ss")
        );
        this.startDate = startDateTime.format("YYYY-MM-DD");
        this.startTime = startDateTime.format("HH:mm:ss");

        this.endDate = endDateTime.format("YYYY-MM-DD");
        this.endTime = endDateTime.format("HH:mm:ss");
      }
    },
    setDefaultStartTime() {
      this.showStartDatePicker = false;
      const now = moment.tz(this.selectedTimezone);
      now.minutes(0).seconds(0).milliseconds(0).add(1, "hours");
      this.startTime = now.format("HH:mm:ss");
      this.endDate = this.startDate;
    },
    getTimestampsForDatabase() {
      const startDateTime = moment
          .tz(`${this.startDate} ${this.startTime}`, this.selectedTimezone)
          .toISOString();
      const endDateTime = moment
          .tz(`${this.endDate} ${this.endTime}`, this.selectedTimezone)
          .toISOString();
      return `[${startDateTime}, ${endDateTime}]`;
    },
    finalizeDateTimeRange() {
      const dateTimeRangeForDB = this.getTimestampsForDatabase();
      this.$emit("update:modelValue", dateTimeRangeForDB);
      this.showDialog = false;
    },
    manuallyChangedEndTime(input) {
      this.detectDuration(this.startTime, input);
    },
    detectDuration(startTime, endTime) {
      this.duration = moment(endTime, "HH:mm:ss").diff(
          moment(startTime, "HH:mm:ss"),
          "minutes"
      );
    },
  },
  watch: {
    startTime(newStartTime) {
      this.endTime = moment(newStartTime, "HH:mm:ss")
          .add(this.duration, "minutes")
          .format("HH:mm:ss");
    },
  },
  mounted() {
    this.parseTstzrange(this.modelValue);
  },
};
</script>

<style scoped></style>
