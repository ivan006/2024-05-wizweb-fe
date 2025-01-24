<template>
  <div :style="!unClickable ? 'cursor: pointer' : ''" @click="clickRow(item)" class="q-pa-sm">
    <template v-for="(header, index) in superOptions.headers">
      <div
          :key="header.name"
          v-if="
            header.field !== 'id' && (index < maxFields || header.usageType === 'actions') &&
            !header.usageType.startsWith('relChildren') &&
            (header.usageType !== 'actions' || superOptions.model.rules.editable(item))
          "
          class="q-pa-xs q-mb-sm"
          style="min-height: 1.375rem"
      >
        <template v-if="index < 2">
          <template v-if="superOptions.headers[0].value === 'id'">
            <template v-if="index === 0"></template>
            <template v-else>
              <div>
                <DatapointForDisplay
                    :item="item"
                    :superOptions="superOptions"
                    :dataPoint="header.userConfig"
                    :header="header"
                    @fetchData="fetchData"
                />
              </div>
            </template>
          </template>
          <template v-else>
            <template v-if="index === 0">
              <DatapointForDisplay
                  :item="item"
                  :superOptions="superOptions"
                  :dataPoint="header.userConfig"
                  :header="header"
                  hideLabel
                  @fetchData="fetchData"
                  isHeading
              />
            </template>
            <template v-else>
              <div>
                <DatapointForDisplay
                    :key="index"
                    :item="item"
                    :superOptions="superOptions"
                    :dataPoint="header.userConfig"
                    :header="header"
                    @fetchData="fetchData"
                />
              </div>
            </template>
          </template>
        </template>
        <template v-else>
          <div>
            <DatapointForDisplay
                :key="index"
                :item="item"
                :superOptions="superOptions"
                :dataPoint="header.userConfig"
                :header="header"
                @fetchData="fetchData"
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import {defineAsyncComponent} from "vue";

export default {
  name: 'RecordFieldsForDisplayGeneric',
  components: {
    DatapointForDisplay: defineAsyncComponent(() => import('./DatapointForDisplay.vue')),
  },
  props: {
    unClickable: {
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
