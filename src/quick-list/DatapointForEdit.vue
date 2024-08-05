<template>
  <DatapointForEditInner
      v-if="compField"
      :modelValue="modelValue[compField.name]"
      @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,compField.name)}"
      :superOptions="superOptions"
      @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
      :field="compField"
  />
</template>

<script>
import DatapointForEditInner from "./DatapointForEditInner.vue";

export default {
  name: "DatapointForEdit",
  components: {
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
      const result = this.superOptions.headers.find((header) => {
        return header.field == this.dataPoint.field
      })
      return result
    },
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
