<template>
  <div
      :style="clickable ? 'cursor: pointer' : ''"
      @click="clickRow(item)"
      :class="colClasses"
  >

    <div style="padding-top:0.03px;">
      <div class="row "  :class="`${template.unsetGutters ? '' : 'q-col-gutter-xs'} ${template.class?.length ? template.class : ''} `">

        <template v-if="template.cols?.length">

          <template v-for="(col, index2) in template.cols" :key="index2">


            <RecordFieldsForDisplayCustom
                :template="col"
                :item="item"
                :childRelations="childRelations"
                :superOptions="superOptions"
                :clickable="clickable"
                @editItem="editItem"
                @deleteItem="deleteItem"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </RecordFieldsForDisplayCustom>
          </template>

          <template v-for="field in superOptions.modelFields" :key="field.name">
            <template v-if="superOptions.model.primaryKey !== field.name">
              <RecordFieldsForEditCustom
                  :modelValue="modelValue"
                  @update:modelValue="updateModelValue"
                  :superOptions="superOptions"
                  @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
                  :template="template"
              />
            </template>
          </template>
        </template>
        <template v-else-if="template.dataPoint">
          <div class="col-12">

            <div class="q-mb-sm">

              <DatapointForEditInner
                  :modelValue="itemData[field.name]"
                  @update:modelValue="(fieldValue)=>{updateModelValue(fieldValue,field.name)}"
                  :superOptions="superOptions"
                  @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
                  :field="field"
              />
            </div>
          </div>
        </template>
      </div>
    </div>


  </div>
</template>

<script>
import DatapointForEditInner from "./DatapointForEditInner.vue";
import SuperSelect from "./SuperSelect.vue";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import DatapointForDisplay from "./DatapointForDisplay.vue";

export default {
  name: "RecordFieldsForEditCustom",
  components: {
    DatapointForDisplay, RecordFieldsForDisplayCustom,
    SuperSelect,
    DatapointForEditInner,
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
