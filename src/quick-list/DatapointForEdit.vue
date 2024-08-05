<template>
  <div>

    <template v-if="dataPoint.xOrientation">
      <div class="">
        <div class="row">
          <template v-if="!dataPoint.hideLabel">
            <div class="q-pr-sm">
              <div class="" style="font-weight: bold;">
                {{ label }}:
              </div>
            </div>
          </template>
          <div>
            <component :is="dataPoint.tag ? dataPoint.tag : 'div'" :class="dataPoint.class ? dataPoint.class : ''">
              <DatapointForEditInner
                  v-if="compHeader"
                  :modelValue="modelValue[compHeader.name]"
                  @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,compHeader.name)}"
                  :superOptions="superOptions"
                  @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
                  :field="compHeader"
              />
            </component>
          </div>
        </div>
      </div>
    </template>
    <template v-else>

      <template v-if="!dataPoint.hideLabel && !hideLabel">
        <div class="" style="font-weight: bold;">
          {{ label }}:
        </div>
      </template>
      <component :is="dataPoint.tag ? dataPoint.tag : 'div'" :class="dataPoint.class ? dataPoint.class : ''">

        <DatapointForEditInner
            v-if="compHeader"
            :modelValue="modelValue[compHeader.name]"
            @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,compHeader.name)}"
            :superOptions="superOptions"
            @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
            :field="compHeader"
            hideLabel
        />
      </component>
    </template>
  </div>
</template>

<script>
import DatapointForEditInner from "./DatapointForEditInner.vue";
import DatapointForDisplayInner from "./DatapointForDisplayInner.vue";

export default {
  name: "DatapointForEdit",
  components: {
    DatapointForDisplayInner,
    DatapointForEditInner,
  },
  props: {
    dataPoint: {
      type: Object,
      default() {
        return {}
      },
    },
    modelValue: {
      type: [Object,String,Number,Boolean],
      default() {
        return null
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
  data() {
    return {
    };
  },
  computed: {
    compHeader() {
      const result = this.superOptions.headers.find((header) => {
        return header.field == this.dataPoint.field
      })
      return result
    },
    label() {
      if (this.dataPoint.label) {
        return this.dataPoint.label;
      } else {
        return this.compHeader ? this.compHeader.label : '';
      }
    }
  },
  methods: {
    updateModelValue(fieldValue, fieldName){
      this.itemData[fieldName] = fieldValue
      this.$emit('update:modelValue', this.itemData)
    }
  },
  mounted() {
    this.itemData = this.modelValue;
  },
};
</script>

<style scoped></style>
