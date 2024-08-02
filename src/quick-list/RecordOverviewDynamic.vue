<template>
  <div :style="clickable ? 'cursor: pointer' : ''" @click="clickRow(item)" class="" :class="template.padding ? template.padding : `q-pa-sm`">
    <template v-for="(row, index) in rows" :key="index">
      <!--this accounts for margin collapsing!-->
      <!--see https://stackoverflow.com/questions/78824507/child-elements-negative-margin-ignored-when-parent-has-zero-padding-due-to-col-->
      <div  style="padding:0.03px;">
        <div class="row q-col-gutter-xs ">
          <template v-for="(col, index2) in row.cols" :key="index2">
            <div :class="`col-${col.width}`">
              <template v-if="col.rows">
                <template v-for="(row2, index3) in col.rows" :key="index3">
                  <div class="row q-col-gutter-xs">
                    <template v-for="(col2, index4) in row2.cols" :key="index4">
                      <div :class="`col-${col2.width}`">
                        <RecordOverviewDynamicDataPoint
                            :item="item"
                            :dataPoint="col2.dataPoint"
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
                </template>
              </template>
              <template v-else>
                <RecordOverviewDynamicDataPoint
                    :item="item"
                    :dataPoint="col.dataPoint"
                    :childRelations="childRelations"
                    :superOptions="superOptions"
                >
                  <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                    <slot :name="slotName" v-bind="slotProps"></slot>
                  </template>
                </RecordOverviewDynamicDataPoint>
              </template>
            </div>
          </template>
        </div>
      </div>
    </template>
    <template v-if="!rows.length">
      <div class="text-center">No data available</div>
    </template>
  </div>
</template>

<script>
import RecordOverviewDynamicDataPoint from './RecordOverviewDynamicDataPoint.vue';

export default {
  name: 'RecordOverviewDynamic',
  components: {RecordOverviewDynamicDataPoint},
  props: {
    template: {
      type: Object,
      default() {
        return {};
      },
    },
    isSummary: {
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
    maxFields: {
      type: Number,
      default() {
        return 999;
      },
    },
    rowsAndDataIndicators: {
      type: Object,
      default() {
        return {};
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
    filteredChildRelations: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  methods: {
    deleteItem(e) {
      this.$emit('deleteItem', e);
    },
    editItem(e) {
      this.$emit('editItem', e);
    },
    clickRow(e) {
      this.$emit('clickRow', e);
    },
  },
  computed: {
    rows() {
      let result = [];

      if (
          this.template &&
          this.template.rows
      ) {
        result = this.template.rows;
      }
      return result;
    },
  },
  mounted() {
  },
};
</script>

<style scoped></style>
