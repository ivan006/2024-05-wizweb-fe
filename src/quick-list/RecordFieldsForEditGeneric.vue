<template>
  <div>
    <template v-for="field in superOptions.modelFields" :key="field.name">
      <template v-if="superOptions.model.primaryKey !== field.name && !field.meta.hideField">
        <div class="q-mb-sm">
          <template v-if="!['relLookupNormal','relChildrenNormal'].includes(field.usageType) ">
            <div v-if="rendered" class="text-subtitle2" :style="`visibility: ${field.label.length ? 'visible' : 'hidden'}`">
              {{ field.label }}:
            </div>
            <DatapointForEditInner
                @superTableMounted="rendered = true"
                :modelValue="itemData[field.name]"
                @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,field.name)}"
                :superOptions="superOptions"
                @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
                :field="field"
                :formServerErrors="formServerErrors"
                :itemErrors="itemErrors"
                hideLabel
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import DatapointForEditInner from "./DatapointForEditInner.vue";
import SuperSelect from "./SuperSelect.vue";
import RecordFieldsForEditCustom from "./RecordFieldsForEditCustom.vue";

export default {
  name: "RecordFieldsForEditGeneric",
  components: {
    RecordFieldsForEditCustom,
    SuperSelect,
    DatapointForEditInner,
  },
  props: {
    itemErrors: {
      type: Object,
      default: () => ({}),
    },
    formServerErrors: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: Object,
      default: () => ({}),
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
      rendered: false,
      itemData: this.modelValue,
      loading: false,
    };
  },
  mounted() {
    this.itemData = this.modelValue;
    // const creatorKey = this.superOptions.modelFields.find((field) => field.usageType == "relForeignKeyCreatorType");
    // if (creatorKey) {
    //   this.itemData[creatorKey.name] = this.superOptions.user.id; // Assuming user has an id property
    // }
  },
  methods: {
    updateModelValue(fieldValue, fieldName){
      this.itemData[fieldName] = fieldValue
      this.$emit('update:modelValue', this.itemData)
    }
  },
  watch: {
    // itemData: {
    //   handler(newValue) {
    //     this.$emit("update:modelValue", newValue);
    //   },
    //   deep: true,
    // },
  },
};
</script>

<style scoped></style>
