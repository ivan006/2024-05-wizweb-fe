<template>
  <div
      :style="clickable ? 'cursor: pointer' : ''"
      @click="clickRow(item)"
      :class="template.paddingClass?.length ? template.paddingClass : 'q-pa-sm'"
  >
    <template v-for="(row, index) in rows" :key="index">
      <!-- this accounts for margin collapsing! -->
      <!-- see https://stackoverflow.com/questions/78824507/child-elements-negative-margin-ignored-when-parent-has-zero-padding-due-to-col -->
      <div style="padding-top:0.03px;">
        <div class="row q-col-gutter-xs" :class="row.class?.length ? row.class : ''">
          <template v-for="(col, index2) in row.cols" :key="index2">
            <div :class="`col-${col.width}`">
              <template v-if="col.rows && col.rows.length">
                <!-- Recursively call the same component for nested rows -->
                <RecordOverviewDynamic
                    :template="{ rows: col.rows }"
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
    rows() {
      return this.template?.rows || [];
    },
  },
  methods: {
    clickRow(item) {
      this.$emit('clickRow', item);
    },
  },
};
</script>

<style scoped></style>
