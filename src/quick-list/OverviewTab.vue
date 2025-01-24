<template>
  <div>
    <template v-if="!item || (item.constructor === Object  && Object.keys(item).length === 0)  ">
      <div class="text-center q-pa-md text-grey-5">None</div>
    </template>
    <template v-else>
      <template v-if="templateOverview && templateOverview.cols">
        <!--<div style="padding-top:0.03px;">-->
        <!--  <div class="row q-col-gutter-xs">-->
        <!--  </div>-->
        <!--</div>-->
        <RecordFieldsForDisplayCustom
            :item="item"
            :superOptions="superOptions"
            :template="templateOverview"
            @fetchData="fetchData"
            @clickRow="clickRow"
            :unClickable="unClickable"
        />
      </template>
      <template v-else>
        <RecordFieldsForDisplayGeneric
            :maxFields="genericMaxFields"
            :item="item"
            :superOptions="superOptions"
            @fetchData="fetchData"
            @clickRow="clickRow"
            :unClickable="unClickable"
        />
      </template>
    </template>

  </div>
</template>

<script>

import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import DatapointForDisplayInner from "./DatapointForDisplayInner.vue";

export default {
  name: 'OverviewTab',
  components: {DatapointForDisplayInner, RecordFieldsForDisplayCustom, RecordFieldsForDisplayGeneric },
  props: {
    unClickable: {
      type: Boolean,
      default() {
        return false;
      },
    },
    genericMaxFields: {
      type: Number,
      default() {
        return 999;
      },
    },
    templateOverview: {
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
    fetchData(e) {
      this.$emit("fetchData", e);
    },
    clickRow(e) {
      this.$emit('clickRow', e);
    },
  },
};
</script>

<style scoped></style>
