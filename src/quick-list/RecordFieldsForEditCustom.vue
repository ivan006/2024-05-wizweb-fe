<template>
  <div>
    <template v-for="field in superOptions.modelFields" :key="field.name">
      <template v-if="superOptions.model.primaryKey !== field.name">
        <div class="q-mb-sm">
          <DatapointForEdit
              :modelValue="itemData[field.name]"
              @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,field.name)}"
              :superOptions="superOptions"
              @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
              :field="field"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import DatapointForEdit from "./DatapointForEdit.vue";
import SuperSelect from "./SuperSelect.vue";

export default {
  name: "RecordFieldsForEditCustom",
  components: {
    SuperSelect,
    DatapointForEdit,
  },
  props: {
    template: {
      type: Object,
      default() {
        return {};
      },
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
      itemData: {},
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
