<template>
  <div :class="colClasses" >

    <div style="padding-top:0.03px;">
      <div class="row "  :class="`${template.unsetGutters ? '' : 'q-col-gutter-xs'} ${template.class?.length ? template.class : ''} `">

        <template v-if="template.cols?.length">

          <!--<template v-for="(col, index2) in template.cols" :key="index2">-->


          <!--  <RecordFieldsForDisplayCustom-->
          <!--      :template="col"-->
          <!--      :item="item"-->
          <!--      :childRelations="childRelations"-->
          <!--      :superOptions="superOptions"-->
          <!--      :clickable="clickable"-->
          <!--      @editItem="editItem"-->
          <!--      @deleteItem="deleteItem"-->
          <!--  >-->
          <!--    <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">-->
          <!--      <slot :name="slotName" v-bind="slotProps"></slot>-->
          <!--    </template>-->
          <!--  </RecordFieldsForDisplayCustom>-->
          <!--</template>-->

          <!--<template v-for="field in superOptions.modelFields" :key="field.name">-->
          <!--  <template v-if="superOptions.model.primaryKey !== field.name">-->
          <!--    <RecordFieldsForEditCustom-->
          <!--        :modelValue="modelValue"-->
          <!--        @update:modelValue="updateModelValue"-->
          <!--        :superOptions="superOptions"-->
          <!--        @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"-->
          <!--        :template="template"-->
          <!--    />-->
          <!--  </template>-->
          <!--</template>-->

          <template  v-for="(col, index2) in template.cols" :key="index2">
            <RecordFieldsForEditCustom
                :modelValue="modelValue"
                @update:modelValue="updateModelValue"
                :superOptions="superOptions"
                @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
                :template="col"
                :formErrors="formErrors"
            />
          </template>
        </template>
        <template v-else-if="template.dataPoint">
          <div class="col-12">
            <div class="q-mb-sm">
              <DatapointForEdit
                  :modelValue="modelValue"
                  @update:modelValue="updateModelValue"
                  :superOptions="superOptions"
                  @updateSetDefaultEndTime="$emit('updateSetDefaultEndTime')"
                  :dataPoint="template.dataPoint"
                  :formErrors="formErrors"
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
import DatapointForEdit from "./DatapointForEdit.vue";

export default {
  name: "RecordFieldsForEditCustom",
  components: {
    DatapointForEdit,
    DatapointForDisplay, RecordFieldsForDisplayCustom,
    SuperSelect,
    DatapointForEditInner,
  },
  props: {
    formErrors: {
      type: Object,
      default: () => ({}),
    },
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
      // itemData: {},
      loading: false,
    };
  },
  computed:{
    colClasses() {
      const baseWidth = this.template.width || 12;

      // Coefficients for each breakpoint
      const coefficients = {
        lg: 1,   // Large screens
        md: 1.5, // Medium screens
        sm: 2,   // Small screens
        xs: 4    // Extra small screens
      };

      // Calculate widths based on coefficients
      const lg = Math.min(Math.round(baseWidth * coefficients.lg), 12);
      const md = Math.min(Math.round(baseWidth * coefficients.md), 12);
      const sm = Math.min(Math.round(baseWidth * coefficients.sm), 12);
      const xs = Math.min(Math.round(baseWidth * coefficients.xs), 12);

      return `col-${lg} col-lg-${lg} col-md-${md} col-sm-${sm} col-xs-${xs}`;
    }
  },
  mounted() {
    // this.itemData = this.modelValue;
    // const creatorKey = this.superOptions.modelFields.find((field) => field.usageType == "relForeignKeyCreatorType");
    // if (creatorKey) {
    //   this.itemData[creatorKey.name] = this.superOptions.user.id; // Assuming user has an id property
    // }
  },
  methods: {
    updateModelValue(item) {
      this.$emit("update:modelValue", item);
    },
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
