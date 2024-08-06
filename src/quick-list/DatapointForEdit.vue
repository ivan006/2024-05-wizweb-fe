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
              <template v-if="dataPoint.type === 'function'">
                <div v-html="dataPoint.function(modelValue)"></div>
              </template>
              <template v-else>
                <DatapointForEditInner
                    v-if="compField"
                    :modelValue="modelValue[compField.name]"
                    @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,compField.name)}"
                    :superOptions="superOptions"
                    @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
                    :field="compField"
                    hideLabel
                />
              </template>
            </component>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <template v-if="!dataPoint.hideLabel">
        <div class="" style="font-weight: bold;" :style="`visibility: ${label.length ? 'visible' : 'hidden'}`">
          {{ label }}:
        </div>
      </template>
      <component :is="dataPoint.tag ? dataPoint.tag : 'div'" :class="dataPoint.class ? dataPoint.class : ''">
        <template v-if="dataPoint.type === 'function'">
          <div v-html="dataPoint.function(modelValue)"></div>
        </template>
        <template v-else>
          <DatapointForEditInner
              v-if="compField"
              :modelValue="modelValue[compField.name]"
              @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,compField.name)}"
              :superOptions="superOptions"
              @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
              :field="compField"
              hideLabel
          />
        </template>
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
    compField() {
      if (this.dataPoint.type === 'function') {
        return { label: this.dataPoint.label };
      } else {
        const result = this.superOptions.modelFields.find((header) => {
          return header.field == this.dataPoint.field
        })
        return result
      }
    },
    label() {
      if (typeof this.dataPoint.label !== "undefined") {
        return this.dataPoint.label;
      } else if(this.dataPoint.type === 'function'){
        return "";
      } else {
        return this.compField ? this.compField.label : '';
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
