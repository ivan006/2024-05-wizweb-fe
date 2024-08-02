<template>
  <div
      :style="clickable ? 'cursor: pointer' : ''"
      @click="clickRow(item)"
      :class="colClasses"
  >

    <div style="padding-top:0.03px;">
      <div class="row "  :class="`${template.unsetGutters ? '' : 'q-col-gutter-xs'} ${template.class?.length ? template.class : ''} `">

        <template v-if="template.cols?.length">

          <template v-for="(col, index2) in template.cols" :key="index2">


            <RecordOverviewDynamic
                :template="col"
                :item="item"
                :childRelations="childRelations"
                :superOptions="superOptions"
                :clickable="clickable"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </RecordOverviewDynamic>
          </template>
        </template>
        <template v-else-if="template.dataPoint">
          <div class="col-12">

            <RecordOverviewDynamicDataPoint
                :item="item"
                :dataPoint="template.dataPoint"
                :childRelations="childRelations"
                :superOptions="superOptions"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </RecordOverviewDynamicDataPoint>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import RecordOverviewDynamicDataPoint from './RecordOverviewDynamicDataPoint.vue';

export default {
  name: 'RecordOverviewDynamic',
  components: { RecordOverviewDynamicDataPoint },
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
    clickable: {
      type: Boolean,
      default() {
        return false;
      },
    },
    childRelations: {
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
  computed: {
    // cols() {
    //   return this.template?.cols || [];
    // },
    // colClasses() {
    //   // const gen = ` col-${template.width ? template.width : '12'} `
    //   // const lg = ` col-lg-${template.width ? template.width : '12'} `
    //   // const md = ` col-md-${template.width ? template.width : '12'} `
    //   // const sm = ` col-sm-${template.width ? template.width : '12'} `
    //   // const xs = ` col-xs-${template.width ? template.width : '12'} `
    //
    //
    //   const baseWidth = this.template.width || 12;
    //   const lg = baseWidth;
    //   const md = baseWidth < 12 ? baseWidth + 2 : 12;
    //   const sm = 12;
    //   return `col-${baseWidth} col-lg-${lg} col-md-${md} col-sm-${sm} col-xs-${sm}`;
    // },methods: {
    colClasses(col) {
      const baseWidth = this.template.width || 12;

      // Coefficients for each breakpoint
      const coefficients = {
        // lg: 1,   // Large screens
        md: 1, // Medium screens
        sm: 2,   // Small screens
        xs: 4    // Extra small screens
      };

      // Calculate widths based on coefficients and the provided formula
      const lg = baseWidth;
      const md = Math.round(baseWidth + (12 - baseWidth) * coefficients.md * baseWidth / 12);
      const sm = Math.round(baseWidth + (12 - baseWidth) * coefficients.sm * baseWidth  / 12);
      const xs = Math.round(baseWidth + (12 - baseWidth) * coefficients.xs * baseWidth  / 12);

      // Ensure widths do not exceed 12
      return `col-${baseWidth} col-lg-${Math.min(lg, 12)} col-md-${Math.min(md, 12)} col-sm-${Math.min(sm, 12)} col-xs-${Math.min(xs, 12)}`;
    }
  },
  methods: {
    clickRow(item) {
      this.$emit('clickRow', item);
    },
  },
};
</script>

<style scoped></style>
