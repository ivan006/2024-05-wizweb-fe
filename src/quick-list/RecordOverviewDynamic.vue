<template>
  <div
      :style="clickable ? 'cursor: pointer' : ''"
      @click="clickRow(item)"
      :class="` col-${template.width ? template.width : '12'} `"
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
  // computed: {
  //   cols() {
  //     return this.template?.cols || [];
  //   },
  // },
  methods: {
    clickRow(item) {
      this.$emit('clickRow', item);
    },
  },
};
</script>

<style scoped></style>
