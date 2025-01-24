<template>
  <div
      :style="!unClickable ? 'cursor: pointer' : ''"
      @click="clickRow(item)"
      :class="colClasses(template.width ? template.width : 12)"
  >

    <div style="padding-top:0.03px;">
      <div
          class="row "
          :class="`${template.unsetGutters ? '' : 'q-col-gutter-xs'} ${template.class?.length ? template.class : ''} `"
          :style="`${template.style?.length ? template.style : ''}`"
      >

        <template v-if="template.cols?.length">

          <template v-for="(col, index2) in template.cols" :key="index2">


            <RecordFieldsForDisplayCustom
                :template="col"
                :item="item"
                :superOptions="superOptions"
                :unClickable="unClickable"
                @fetchData="fetchData"
            />
          </template>
        </template>
        <template v-else-if="template.dataPoint && (template.dataPoint.field !== 'actions' || superOptions.model.rules.editable(item))">
          <div class="col-12" style="overflow: hidden;">
            <DatapointForDisplay
                :item="item"
                :dataPoint="template.dataPoint"
                :superOptions="superOptions"
                @fetchData="fetchData"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import DatapointForDisplay from './DatapointForDisplay.vue';

export default {
  name: 'RecordFieldsForDisplayCustom',
  components: {DatapointForDisplay },
  props: {
    template: {
      type: Object,
      default() {
        return {};
      },
    },
    item: {
      type: Object,
      default() {
        return {};
      },
    },
    unClickable: {
      type: Boolean,
      default() {
        return false;
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
  computed: {
    // cols() {
    //   return this.template?.cols || [];
    // },

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
    clickRow(item) {
      this.$emit('clickRow', item);
    },
  },
};
</script>

<style scoped></style>
