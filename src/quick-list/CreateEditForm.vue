<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{titlePrefix}} {{ template?.entityName ? template?.entityName : "Item" }}</div>
    </q-card-section>
    <q-card-section>
      <q-form ref="editForm">
        <template v-if="template && template.cols">
          <div style="padding-top:0.03px;">
            <div class="row q-col-gutter-xs">
              <RecordFieldsForEditCustom
                  :modelValue="modelValue"
                  @update:modelValue="updateModelValue"
                  :superOptions="superOptions"
                  @updateSetDefaultEndTime="updateSetDefaultEndTime"
                  :template="template"
                  :formErrors="formErrors"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <RecordFieldsForEditGeneric
              :modelValue="modelValue"
              @update:modelValue="updateModelValue"
              :superOptions="superOptions"
              @updateSetDefaultEndTime="updateSetDefaultEndTime"
              :formErrors="formErrors"
          />
        </template>
      </q-form>
    </q-card-section>
    <q-card-actions >
      <div style="width:100%;">
        <div class="text-right text-negative" >
          {{formErrors.message ? formErrors.message : ''}}
        </div>
        <div class="text-right">
          <q-btn flat label="Cancel" @click="cancel" />
          <q-btn flat label="Save" color="primary" @click="editItemSubmit" :loading="loading" />
        </div>
      </div>
    </q-card-actions>
  </q-card>
</template>

<script>
import RelationComponent from "./RelationComponent.vue";
import DateAndTimeRangePicker from "./DateAndTimeRangePicker.vue";
import DateAndTimePicker from "./DateAndTimePicker.vue";
import moment from "moment";
import SearchGooglePlace from "./SearchGooglePlace.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import SuperSelect from "./SuperSelect.vue";
// import SuperTable from "./SuperTable.vue";
import { defineAsyncComponent } from 'vue'
import RecordFieldsForEditGeneric from "./RecordFieldsForEditGeneric.vue";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import RecordFieldsForEditCustom from "./RecordFieldsForEditCustom.vue";
import CreateButton from "./CreateButton.vue";

const AsyncSuperTableComponent = defineAsyncComponent(() =>
    import('./SuperTable.vue')
);

export default {
  name: "CreateEditForm",
  components: {
    CreateButton,
    RecordFieldsForEditCustom,
    RecordFieldsForDisplayCustom, RecordFieldsForDisplayGeneric,
    RecordFieldsForEditGeneric,
    SuperSelect,
    SearchGooglePlace,
    DateAndTimePicker,
    DateAndTimeRangePicker,
    RelationComponent,
    // SuperTable,
    // SuperTable: () => import("./SuperTable.vue"),
    SuperTable: AsyncSuperTableComponent
  },
  props: {
    template: {
      type: Object,
      default() {
        return {};
      },
    },
    titlePrefix: {
      type: String,
      default: () => "",
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    formErrors: {
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
  methods: {
    updateSetDefaultEndTime(arg) {
      const timeRangeEndField = this.superOptions.modelFields.find((field) => field.usageType == "timeRangeEnd");
      this.itemData[timeRangeEndField.name] = moment(arg).add(2, "hours").toISOString();
    },
    cancel() {
      this.$emit("cancel");
    },
    updateModelValue(item) {
      this.$emit("update:modelValue", item);
    },
    async editItemSubmit() {
      try {
        const isValid = await this.$refs.editForm.validate();
        if (isValid) {
          this.$emit("submit");
        }
      } catch (error) {
        // console.error("Error during form validation:", error);
      }
    }
  },
  mounted(){
  }
};
</script>

<style scoped></style>
