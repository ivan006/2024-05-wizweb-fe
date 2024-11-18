<template>
  <div>
    <q-input
        label="Time Filter"
        type="text"
        v-model="displayDate"
        :error="false"
        :error-message="''"
        disable
        filled
        dense
        @click="toggleMenu"
        class="FilterTimeTrigger"
    />
    <q-menu
        v-model="menu"
        fit
        class="q-pt-none"
        no-corner
        :close-on-content-click="false"
    >
      <q-card>
        <q-card-section>
          <q-select
              :options="years"
              v-model="selectedYear"
              label="Year"
              option-label="label"
              option-value="value"
              dense
              filled
              emitValue
              mapOptions
              class="q-mb-sm"
          ></q-select>

          <q-select
              :options="months"
              v-model="selectedMonth"
              label="Month"
              :disable="!selectedYear"
              option-label="label"
              option-value="value"
              dense
              filled
              emitValue
              mapOptions
              class="q-mb-sm"
          ></q-select>

          <q-select
              :options="weeks"
              v-model="selectedWeek"
              label="Week"
              :disable="!selectedMonth"
              option-label="label"
              option-value="value"
              dense
              filled
              emitValue
              mapOptions
              class="q-mb-sm"
          ></q-select>

          <q-select
              :options="days"
              v-model="selectedDay"
              label="Day"
              :disable="!selectedWeek"
              option-label="label"
              option-value="value"
              dense
              filled
              emitValue
              mapOptions
              class="q-mb-sm"
          ></q-select>

          <q-card-actions>
            <q-space></q-space>
            <q-btn color="primary" @click="menu = false">OK</q-btn>
          </q-card-actions>
        </q-card-section>
      </q-card>
    </q-menu>
  </div>
</template>

<script>
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek"; // For ISO week support
import localizedFormat from "dayjs/plugin/localizedFormat"; // For "Do" formatting
import weekday from "dayjs/plugin/weekday"; // For week-day-based operations
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"; // For comparison
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"; // For comparison


dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export default {
  name: "FilterTime",
  props: {
    modelField: {
      type: Object,
      default() {
        return {};
      },
    },
    modelValue: {
      type: Object,
      default: () => ({
        year: null,
        month: null,
        week: null,
        day: null,
        range: {
          start: null,
          end: null,
        },
      }),
    },
  },
  data() {
    return {
      years: this.generateYears(),
      months: [],
      weeks: [],
      days: [],
      menu: false,
    };
  },
  computed: {
    displayDate() {
      if (this.selectedDay) {
        return dayjs(this.selectedDay).format("ddd, MMM D, YYYY");
      }
      if (this.selectedWeek) {
        const startOfWeek = dayjs()
            .year(this.selectedYear)
            .month(this.selectedMonth - 1)
            .isoWeek(this.selectedWeek)
            .startOf("isoWeek");
        const endOfWeek = startOfWeek.clone().endOf("isoWeek");

        if (startOfWeek.month() === endOfWeek.month()) {
          return `${startOfWeek.format("ddd D")} - ${endOfWeek.format(
              "ddd D, MMM, YYYY",
          )}`;
        } else {
          return `${startOfWeek.format("ddd D, MMM")} - ${endOfWeek.format(
              "ddd D, MMM, YYYY",
          )}`;
        }
      }
      if (this.selectedMonth) {
        return dayjs(`${this.selectedYear}-${this.selectedMonth}-01`).format(
            "MMM, YYYY",
        );
      }
      if (this.selectedYear) {
        return this.selectedYear.toString();
      }
      return ""; // Default case if nothing is selected
    },
    selectedYear: {
      get() {
        return this.modelValue?.year ? this.modelValue?.year : null;
      },
      set(val) {
        const updatedValues = {
          ...this.modelValue,
          year: val,
          month: null,
          week: null,
          day: null,
        };
        this.$emit("update:modelValue", {
          ...updatedValues,
          range: this.computeRange(updatedValues),
        });
        this.months = this.generateMonths();
      },
    },
    selectedMonth: {
      get() {
        return this.modelValue?.month ? this.modelValue?.month : null;
      },
      set(val) {
        const updatedValues = {
          ...this.modelValue,
          month: val,
          week: null,
          day: null,
        };
        this.$emit("update:modelValue", {
          ...updatedValues,
          range: this.computeRange(updatedValues),
        });

        this.weeks = this.generateWeeks(this.selectedYear, val);
      },
    },
    selectedWeek: {
      get() {
        return this.modelValue?.week ? this.modelValue?.week : null;
      },
      set(val) {
        const updatedValues = {
          ...this.modelValue,
          week: val,
          day: null,
        };
        this.$emit("update:modelValue", {
          ...updatedValues,
          range: this.computeRange(updatedValues),
        });

        this.days = this.generateDays(
            this.selectedYear,
            this.selectedMonth,
            val,
        );
      },
    },
    selectedDay: {
      get() {
        return this.modelValue?.day ? this.modelValue?.day : null;
      },
      set(val) {
        const updatedValues = { ...this.modelValue, day: val };
        this.$emit("update:modelValue", {
          ...updatedValues,
          range: this.computeRange(updatedValues),
        });
      },
    },
  },
  methods: {
    toggleMenu() {
      this.menu = !this.menu;
    },
    computeRange(values) {
      let startDate, endDate;
      if (values.day) {
        startDate = dayjs(values.day).startOf("day");
        endDate = dayjs(values.day).endOf("day");
      } else if (values.week) {
        startDate = dayjs()
            .year(values.year)
            .isoWeek(values.week)
            .startOf("isoWeek");
        endDate = startDate.clone().endOf("isoWeek");
      } else if (values.month) {
        startDate = dayjs(`${values.year}-${values.month}-01`, "YYYY-MM-DD");
        endDate = startDate.clone().endOf("month");
      } else if (values.year) {
        startDate = dayjs(`${values.year}-01-01`, "YYYY-MM-DD");
        endDate = dayjs(`${values.year}-12-31`, "YYYY-MM-DD");
      }
      return {
        start: startDate ? startDate.format("YYYY-MM-DD") : null,
        end: endDate ? endDate.format("YYYY-MM-DD") : null,
      };
    },
    generateYears() {
      const currentYear = dayjs().year();
      const result = [{ label: "All", value: null }];
      for (let i = 0; i < 10; i++) {
        const year = currentYear - i;
        const label = year === currentYear ? `${year} (Current Year)` : year;
        result.push({ label, value: year });
      }
      return result;
    },
    generateMonths() {
      const currentMonth = dayjs().month(); // 0-11
      const result = [{ label: "All", value: null }];
      for (let month = 0; month < 12; month++) {
        const label =
            month === currentMonth
                ? `${dayjs().month(month).format("MMMM")} (Current Month)`
                : dayjs().month(month).format("MMMM");
        result.push({ label, value: month + 1 });
      }
      return result;
    },
    generateWeeks(year, month) {
      const startOfMonth = dayjs(`${year}-${month}-01`, "YYYY-MM-DD").startOf(
          "month",
      );
      const endOfMonth = startOfMonth.clone().endOf("month");
      const today = dayjs();
      const result = [{ label: "All", value: null }];
      let weekNum = 1;

      let current = startOfMonth.clone();
      while (
          current.isBefore(endOfMonth) ||
          current.isSame(endOfMonth, "day")
          ) {
        const startOfWeek = current.startOf("isoWeek");
        const endOfWeek = startOfWeek.clone().endOf("isoWeek");
        let label;
        if (startOfWeek.month() === endOfWeek.month()) {
          label = `Week ${weekNum} (${startOfWeek.format("MMM D")} - ${endOfWeek.format(
              "D",
          )})`;
        } else {
          label = `Week ${weekNum} (${startOfWeek.format("MMM D")} - ${endOfWeek.format(
              "MMM D",
          )})`;
        }
        if (today.isBetween(startOfWeek, endOfWeek, "day", "[]")) {
          label = `${label} (Current Week)`;
        }
        result.push({ label, value: startOfWeek.isoWeek() });

        current = current.add(1, "week");
        weekNum++;
      }

      return result;
    },
    generateDays(year, month, week) {
      const start = dayjs().year(year).isoWeek(week).startOf("isoWeek");
      const end = start.add(6, "day");
      const days = [];
      const today = dayjs().format("YYYY-MM-DD");

      let current = start.clone();
      while (current.isBefore(end) || current.isSame(end, "day")) {
        let label = current.format("dd, Do");
        if (current.format("YYYY-MM-DD") === today) {
          label = `${label} (Today)`;
        }
        days.push({
          label: label,
          value: current.format("YYYY-MM-DD"),
        });
        current = current.add(1, "day");
      }

      const filteredDays = days.filter(
          (day) => dayjs(day.value).month() + 1 === month,
      );

      return [{ label: "All", value: null }, ...filteredDays];
    },
  },
  mounted() {
    this.filtersData = this.modelValue;
  },
};

</script>

<style>
.FilterTimeTrigger > div {
  cursor: pointer !important;
}

.FilterTimeTrigger.q-field--disabled .q-field__control > div {
  opacity: 1 !important;
}
</style>
