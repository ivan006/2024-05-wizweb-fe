<template>
  <div>

    <template v-if="!items.length">
      <template v-if="loading">
        <div class="text-center q-pa-md">Loading...</div>
      </template>
      <template v-else>
        <div class="text-center q-pa-md text-grey-5">None</div>
      </template>
    </template>
    <template v-else>
      <div
          class="row q-col-gutter-md justify-center"
      >
        <template v-for="item in items" :key="item.name">

          <div :class="colClasses(gridColWidth)" >

            <div class="q-card q-mx-auto" style="height: 100%; overflow: hidden;">
              <OverviewTab
                  :genericMaxFields="6"
                  :item="item"
                  :superOptions="superOptions"
                  :templateOverview="templateListGrid"
                  @fetchData="fetchData"
                  @clickRow="clickRow"
                  :unClickable="unClickable || !superOptions.model.rules.readable(item)"
              />
            </div>

          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import OverviewTab from "./OverviewTab.vue";

export default {
  name: "SuperTableGrid",
  components: {
    OverviewTab,
  },
  props: {
    loading: {
      type: Boolean,
      default() {
        return false;
      },
    },
    excludedCols: {
      type: Array,
      default() {
        return [];
      },
    },
    unClickable: {
      type: Boolean,
      default() {
        return false;
      },
    },
    templateListGrid: {
      type: Object,
      default() {
        return {};
      },
    },
    gridColWidth: {
      type: Number,
      default() {
        return 3;
      },
    },
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    superOptions: {
      type: Object,
      default() {
        return {
          headers: [],
          modelFields: [],
          displayMapField: false,
          model: {},
          canEdit: false,
          currentParentRecord: {},
        };
      },
    },
  },
  methods: {

    colClasses(baseWidth = 12) {
      baseWidth = +baseWidth

      // Coefficients for each breakpoint
      const coefficients = {
        lg: 1,   // Large screens
        md: 1.5, // Medium screens
        sm: 2,   // Small screens
        xs: 4    // Extra small screens
      };

      // Rounding function to the nearest value from the set [1, 2, 3, 4, 6, 12]
      function roundToNearestSet(value) {
        // return Math.min(Math.round(value), 12)
        const set = [1, 2, 3, 4, 6, 12];
        return set.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));
      }

      // Calculate widths based on coefficients and round them
      const lg = roundToNearestSet(baseWidth * coefficients.lg);
      const md = roundToNearestSet(baseWidth * coefficients.md);
      const sm = roundToNearestSet(baseWidth * coefficients.sm);
      const xs = roundToNearestSet(baseWidth * coefficients.xs);

      return `col-${lg} col-lg-${lg} col-md-${md} col-sm-${sm} col-xs-${xs}`;
    },
    fetchData(e) {
      this.$emit("fetchData", e);
    },
    clickRow(e) {
      this.$emit("clickRow", e[this.superOptions.model.primaryKey], e);
    },
  },
};
</script>

<style scoped></style>
