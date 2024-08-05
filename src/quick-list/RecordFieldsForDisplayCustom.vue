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


            <RecordFieldsForDisplayCustom
                :template="col"
                :item="item"
                :childRelations="childRelations"
                :superOptions="superOptions"
                :clickable="clickable"
                @editItem="editItem"
                @deleteItem="deleteItem"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </RecordFieldsForDisplayCustom>
          </template>
        </template>
        <template v-else-if="template.dataPoint">
          <div class="col-12">

            <DatapointForDisplay
                :item="item"
                :dataPoint="template.dataPoint"
                :childRelations="childRelations"
                :superOptions="superOptions"
                @editItem="editItem"
                @deleteItem="deleteItem"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </DatapointForDisplay>
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
  components: { DatapointForDisplay },
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

    colClasses() {
      const baseWidth = this.template.width || 12;

      // Coefficients for each breakpoint
      const coefficients = {
        lg: 1,   // Large screens
        md: 1.5, // Medium screens
        sm: 2,   // Small screens
        xs: 4    // Extra small screens
      };

      // Calculate widths based on coefficients
      const lg = Math.min(Math.round(baseWidth * coefficients.lg), 12);
      const md = Math.min(Math.round(baseWidth * coefficients.md), 12);
      const sm = Math.min(Math.round(baseWidth * coefficients.sm), 12);
      const xs = Math.min(Math.round(baseWidth * coefficients.xs), 12);

      return `col-${lg} col-lg-${lg} col-md-${md} col-sm-${sm} col-xs-${xs}`;
    }
  },
  methods: {
    deleteItem(e) {
      this.$emit("deleteItem", e);
    },
    editItem(e) {
      this.$emit("editItem", e);
    },
    clickRow(item) {
      this.$emit('clickRow', item);
    },
  },
};
</script>

<style scoped></style>
