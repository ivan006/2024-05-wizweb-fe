<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-card-section>
      <q-form ref="editForm">
        <template v-for="field in superOptions.modelFields" :key="field.name">
          <div class="q-mb-sm">
            <template v-if="field.dataType === 'uid'"></template>
            <template v-else-if="field.usageType.startsWith('rel')">
              <template v-if="field.usageType.startsWith('relLookup')"></template>
              <template v-else-if="field.usageType.startsWith('relForeignKeyNormal')">
                <SuperSelect
                    :modelField="field"
                    v-model="itemData[field.name]"
                    :model="field.meta.field.parent"
                    variant="outlined"
                    density="default"
                    :user="superOptions.user"
                    :rules="[() => true]"
                />
              </template>
              <template v-else-if="field.usageType.startsWith('relForeignKeyMapExtraRel')">
                <RelationComponent
                    :configs="field"
                    v-model="itemData[field.name]"
                    readonly
                />
              </template>
              <template v-else-if="field.usageType == 'relForeignKeyOwnerAppliedToProviderType'">
                <SuperSelect
                    :modelField="field"
                    v-model="itemData[field.name]"
                    :model="field.meta.field.parent"
                    readonly
                    variant="outlined"
                    density="default"
                    :user="superOptions.user"
                />
              </template>
              <template v-else-if="field.usageType !== 'relChildrenNormal'">
                <RelationComponent
                    :configs="field"
                    v-model="itemData[field.name]"
                />
              </template>
            </template>
            <template v-else-if="field.usageType == 'timeRangeType'">
              <DateAndTimeRangePicker
                  :label="field.label"
                  v-model="itemData[field.name]"
                  :rules="field.meta.rules"
              />
            </template>
            <template v-else-if="field.usageType == 'timeRangeStart'">
              <DateAndTimePicker
                  :label="field.label"
                  v-model="itemData[field.name]"
                  :rules="field.meta.rules"
                  @update:modelValue="setDefaultForEndTime"
              />
            </template>
            <template v-else-if="field.usageType == 'timeRangeEnd'">
              <DateAndTimePicker
                  :label="field.label"
                  v-model="itemData[field.name]"
                  :rules="field.meta.rules"
              />
            </template>
            <template v-else-if="field.usageType == 'timestampType'">
              <DateAndTimePicker
                  :label="field.label"
                  v-model="itemData[field.name]"
                  :rules="field.meta.rules"
              />
            </template>
            <template v-else-if="field.usageType == 'readOnlyTimestampType'">
              <DateAndTimePicker
                  :label="field.label"
                  v-model="itemData[field.name]"
                  :rules="field.meta.rules"
                  disabled
              />
            </template>
            <template v-else-if="field.usageType === 'mapName'">
              <SearchGooglePlace
                  :configs="field"
                  v-model="itemData[field.name]"
                  @change="searchGooglePlace"
              />
            </template>
            <template v-else-if="field.usageType.startsWith('mapExtra')">
              <q-input
                  :label="field.label"
                  v-model="itemData[field.name]"
                  :rules="field.meta.rules"
                  readonly
                  style="display: none"
                  outlined
              />
            </template>
            <template v-else-if="field.usageType == 'normal'">
              <template v-if="field.dataType === 'string'">
                <q-input
                    :label="field.label"
                    v-model="itemData[field.name]"
                    :rules="field.meta.rules"
                    outlined
                />
              </template>
              <template v-else-if="field.dataType === 'boolean'">
                <q-checkbox
                    :label="field.label"
                    v-model="itemData[field.name]"
                    :rules="field.meta.rules"
                />
              </template>
              <template v-else-if="field.dataType === 'number'">
                <q-input
                    :label="field.label"
                    v-model="itemData[field.name]"
                    :rules="field.meta.rules"
                    type="number"
                    outlined
                />
              </template>
              <template v-else-if="field.dataType === 'attr'">
                <q-input
                    :label="field.label"
                    v-model="itemData[field.name]"
                    :rules="field.meta.rules"
                    outlined
                />
              </template>
            </template>
            <template v-else>
              <q-input
                  :label="field.label"
                  v-model="itemData[field.name]"
                  :rules="field.meta.rules"
                  outlined
              />
            </template>
          </div>
        </template>
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

export default {
  name: "CreateEditForm",
  components: {
    SuperSelect,
    SearchGooglePlace,
    DateAndTimePicker,
    DateAndTimeRangePicker,
    RelationComponent,
  },
  props: {
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
      default: () => ({
        headers: [],
        modelFields: [],
        displayMapField: false,
        model: {},
        canEdit: false,
        currentParentRecord: {},
        user: {},
      }),
    },
  },
  data() {
    return {
      itemData: {},
      loading: false,
    };
  },
  computed: {
    placeFieldsWithFieldNames() {
      let result = [];
      const mapName = this.superOptions.modelFields.find((field) => field.usageType == "mapName");
      if (mapName) {
        for (const placeFieldType of QuickListsHelpers.mapPlaceFields()) {
          const placeField = this.superOptions.modelFields.find((field) => field.usageType == placeFieldType.flag);
          if (placeField) {
            result.push({ ...placeFieldType, fieldNames: placeField.name });
          }
        }
      }
      return result;
    },
  },
  methods: {
    cancel() {
      this.$emit("cancel");
    },
    editItemSubmit() {
      if (this.$refs.editForm.validate()) {
        this.$emit("submit");
      }
    },
    setDefaultForEndTime(arg) {
      const timeRangeEndField = this.superOptions.modelFields.find((field) => field.usageType == "timeRangeEnd");
      this.itemData[timeRangeEndField.name] = moment(arg).add(2, "hours").toISOString();
    },
    async searchGooglePlace(arg) {
      // Implement the necessary logic
    },
  },
  mounted() {
    this.itemData = this.modelValue;
    const creatorKey = this.superOptions.modelFields.find((field) => field.usageType == "relForeignKeyCreatorType");
    if (creatorKey) {
      this.itemData[creatorKey.name] = this.superOptions.user.id; // Assuming user has an id property
    }
  },
  watch: {
    itemData: {
      handler(newValue) {
        this.$emit("update:modelValue", newValue);
      },
      deep: true,
    },
  },
};
</script>

<style scoped></style>
