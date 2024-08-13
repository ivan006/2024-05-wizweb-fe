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
                  :formServerErrors="formServerErrors"
                  :itemErrors="itemErrors"
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
              :formServerErrors="formServerErrors"
              :itemErrors="itemErrors"
          />
        </template>
      </q-form>
    </q-card-section>
    <q-card-actions>
      <div style="width:100%;">
        <div class="text-right text-negative">
          {{formServerErrors.message ? formServerErrors.message : ''}}
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
import moment from "moment";
import SearchGooglePlace from "./SearchGooglePlace.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import SuperSelect from "./SuperSelect.vue";
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
    DateAndTimeRangePicker,
    RelationComponent,
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
    formServerErrors: {
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
      itemErrors: {}, // Track individual field errors
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
    getRequiredFields() {
      return this.superOptions.modelFields
          .filter(field => field.meta && field.meta.required)
          .map(field => field.name);
    },
    validateField(field, value) {
      if (!value) {
        this.itemErrors[field] = 'Required';
      } else {
        delete this.itemErrors[field];
      }
    },
    validateForm() {
      this.itemErrors = {}; // Clear previous errors

      // Get required fields from superOptions.modelFields
      const requiredFields = this.getRequiredFields();

      // Validate only the required fields
      requiredFields.forEach(field => {
        this.validateField(field, this.modelValue[field]);
      });

      return Object.keys(this.itemErrors).length === 0;
    },
    async editItemSubmit() {
      if (this.validateForm()) {
        this.$emit("submit");
      }
    }
  }
};
</script>

