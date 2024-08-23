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
import moment from 'moment';

export default {
  name: 'FilterTime',
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
        return moment(this.selectedDay).format('ddd, MMM D, YYYY');
      }
      if (this.selectedWeek) {
        const startOfWeek = moment()
            .year(this.selectedYear)
            .month(this.selectedMonth - 1)
            .isoWeek(this.selectedWeek)
            .startOf('isoWeek');
        const endOfWeek = startOfWeek.clone().endOf('isoWeek');

        if (startOfWeek.month() === endOfWeek.month()) {
          return `${startOfWeek.format('ddd D')} - ${endOfWeek.format(
              'ddd D, MMM, YYYY'
          )}`;
        } else {
          return `${startOfWeek.format('ddd D, MMM')} - ${endOfWeek.format(
              'ddd D, MMM, YYYY'
          )}`;
        }
      }
      if (this.selectedMonth) {
        return moment(`${this.selectedYear}-${this.selectedMonth}-01`).format(
            'MMM, YYYY'
        );
      }
      if (this.selectedYear) {
        return this.selectedYear.toString();
      }
      return ''; // Default case if nothing is selected
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
        this.$emit('update:modelValue', {
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
        this.$emit('update:modelValue', {
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
        this.$emit('update:modelValue', {
          ...updatedValues,
          range: this.computeRange(updatedValues),
        });

        this.days = this.generateDays(
            this.selectedYear,
            this.selectedMonth,
            val
        );
      },
    },
    selectedDay: {
      get() {
        return this.modelValue?.day ? this.modelValue?.day : null;
      },
      set(val) {
        const updatedValues = { ...this.modelValue, day: val };
        this.$emit('update:modelValue', {
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

        startDate = moment(values.day).startOf('day');
        endDate = moment(values.day).add(1, 'day').startOf('day');

        // startDate = endDate = moment(values.day);
      } else if (values.week) {
        startDate = moment()
            .year(values.year)
            .isoWeek(values.week)
            .isoWeekday(1);
        endDate = startDate.clone().endOf('isoWeek');
      } else if (values.month) {
        startDate = moment(`${values.year}-${values.month}-01`, 'YYYY-MM-DD');
        endDate = startDate.clone().endOf('month');
      } else if (values.year) {
        startDate = moment(`${values.year}-01-01`, 'YYYY-MM-DD');
        endDate = moment(`${values.year}-12-31`, 'YYYY-MM-DD');
      }
      return {
        start: startDate ? startDate.format('YYYY-MM-DD') : null,
        end: endDate ? endDate.format('YYYY-MM-DD') : null,
      };
    },
    generateYears() {
      const currentYear = moment().year();
      const result = [];

      result.push({
        label: 'All',
        value: null,
      });

      for (let yearsBack = 0; yearsBack < 10; yearsBack++) {
        result.push({
          label: currentYear - yearsBack,
          value: currentYear - yearsBack,
        });
      }

      return result;
    },
    generateMonths() {
      const result = [];

      result.push({
        label: 'All',
        value: null,
      });

      for (let month = 0; month < 12; month++) {
        result.push({
          label: moment().month(month).format('MMMM'),
          value: +moment().month(month).format('MM'),
        });
      }
      return result;
    },
    generateWeeks(year, month) {
      const startOfMonth = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf(
          'month'
      );
      const endOfMonth = startOfMonth.clone().endOf('month');
      const result = [];

      result.push({
        label: 'All',
        value: null,
      });

      let weekNum = 1
      while (startOfMonth <= endOfMonth) {
        const startOfWeek = startOfMonth.clone().startOf('isoWeek');
        const endOfWeek = startOfWeek.clone().endOf('isoWeek');
        let label;

        if (startOfWeek.month() === endOfWeek.month()) {
          label = `Week ${weekNum} (${startOfWeek.format('MMM D')} - ${endOfWeek.format('D')})`;
        } else {
          label = `Week ${weekNum} (${startOfWeek.format('MMM D')} - ${endOfWeek.format(
              'MMM D'
          )})`;
        }

        result.push({
          label: label,
          value: startOfWeek.isoWeek(),
        });

        startOfMonth.add(1, 'week');
        ++weekNum
      }

      return result;
    },
    generateDays(year, month, week) {
      const weekNumber = week;
      const start = moment()
          .year(year)
          .isoWeek(weekNumber)
          .isoWeekday(1);

      const end = start.clone().endOf('isoWeek');
      const days = [];

      while (start <= end) {
        days.push({
          label: start.format('dd, Do'),
          value: start.format('YYYY-MM-DD'),
        });
        start.add(1, 'day');
      }

      const filteredDays = days.filter(
          (day) => +moment(day.value).format('MM') === month
      );

      const result = [
        {
          label: 'All',
          value: null,
        },
        ...filteredDays,
      ];
      return result;
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
