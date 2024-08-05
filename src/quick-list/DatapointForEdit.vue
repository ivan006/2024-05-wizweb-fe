<template>
  <div>

    <template v-if="dataPoint.xOrientation">
      <div class="">
        <div class="row">
          <div class="q-pr-sm col-6 col-md-6 col-sm-6 col-xs-6">
            <div class="" style="font-weight: bold; line-height: 3em;">
              {{ label }}:
            </div>
          </div>
          <div class="col-6 col-md-6 col-sm-6 col-xs-6">
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
          </div>
        </div>
      </div>
    </template>
    <template v-else>

      <component :is="dataPoint.tag ? dataPoint.tag : 'div'" :class="dataPoint.class ? dataPoint.class : ''">
        <DatapointForEditInner
            v-if="compHeader"
            :modelValue="modelValue[compHeader.name]"
            @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,compHeader.name)}"
            :superOptions="superOptions"
            @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
            :field="compHeader"
            :hideLabel="dataPoint.hideLabel"
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
