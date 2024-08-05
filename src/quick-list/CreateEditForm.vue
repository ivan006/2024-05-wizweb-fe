<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-card-section>
      <q-form ref="editForm">
        <RecordFieldsForEditGeneric
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            :superOptions="superOptions"
            @updateSetDefaultEndTime="updateSetDefaultEndTime"
        />
      </q-form>
    </q-card-section>
    <q-card-actions align="right">
      <q-btn flat label="Cancel" @click="cancel" />
      <q-btn flat label="Save" color="primary" @click="editItemSubmit" :loading="loading" />
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

const AsyncSuperTableComponent = defineAsyncComponent(() =>
    import('./SuperTable.vue')
);

export default {
  name: "CreateEditForm",
  components: {
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
    title: {
      type: String,
      default: () => "",
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
    editItemSubmit() {
      if (this.$refs.editForm.validate()) {
        this.$emit("submit");
      }
    },
  },
  mounted(){
  }
};
</script>

<style scoped></style>
