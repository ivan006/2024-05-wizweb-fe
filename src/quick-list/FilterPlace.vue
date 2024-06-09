<template>
  <div>
    <q-menu v-model="menu" fit class="q-pt-none" no-corner>
      <template v-slot:activator="{ attrs }">
        <q-input
            v-bind="attrs"
            label="Place Filter"
            type="text"
            v-model="displayPlace"
            readonly
            dense
            outlined
            placeholder="All"
        />
      </template>

      <q-card>
        <q-card-section>
          <template
              v-for="childFilter in filterField.children"
              :key="childFilter.name"
          >
            <template
                v-if="childFilter.usageType.startsWith('relForeignKeyMapExtraRel')"
            >
              <div class="q-mt-md">
                <SuperSelect
                    allowAll
                    v-if="typeof filtersData[childFilter.name] !== 'undefined'"
                    :modelField="childFilter"
                    :model="childFilter.meta.relatedModel"
                    :filters="getFilters(childFilter)"
                    v-model="filtersData[childFilter.name]"
                    :disabled="
                    filterParentName(childFilter) &&
                    !modelValue[filterParentName(childFilter)]
                  "
                    @update:modelValue="handleSelectChange(childFilter.name)"
                    :user="user"
                />
              </div>
            </template>
          </template>

          <q-btn color="primary" class="q-mt-md" @click="menu = false">OK</q-btn>
        </q-card-section>
      </q-card>
    </q-menu>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import SuperSelect from "./SuperSelect.vue";
import QuickListsHelpers from "./QuickListsHelpers";

export default {
  name: "FilterPlace",
  components: { SuperSelect },
  props: {
    filterField: {
      type: Object,
      default: () => ({}),
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      menu: false,
      filtersData: [],
      placeFieldLevelTypes: [
        "relForeignKeyMapExtraRelCountry",
        "relForeignKeyMapExtraRelAdminArea1",
        "relForeignKeyMapExtraRelAdminArea2",
        "relForeignKeyMapExtraRelLocality",
        "relForeignKeyMapExtraRelSublocality",
      ],
      parentRelationships: {
        relForeignKeyMapExtraRelCountry: null,
        relForeignKeyMapExtraRelAdminArea1: "relForeignKeyMapExtraRelCountry",
        relForeignKeyMapExtraRelAdminArea2: "relForeignKeyMapExtraRelAdminArea1",
        relForeignKeyMapExtraRelLocality: "relForeignKeyMapExtraRelAdminArea2",
        relForeignKeyMapExtraRelSublocality: "relForeignKeyMapExtraRelLocality",
      },
    };
  },
  computed: {
    displayPlace() {
      let displayText = "";
      const placeFields = this.filterField.children;

      for (let placeFieldLevelType of this.placeFieldLevelTypes) {
        let placeField = placeFields.find(
            (placeField) => placeField.usageType === placeFieldLevelType
        );

        if (
            placeField &&
            this.filtersData[placeField.name] &&
            this.filtersData[placeField.name]
        ) {
          let displayName = this.fetchDisplayNameFromVuex(
              placeField.meta.relatedModel,
              this.filtersData[placeField.name]
          );
          if (displayName) {
            displayText = displayName;
          }
        }
      }

      return displayText;
    },
  },
  methods: {
    handleSelectChange(fieldName) {
      const changedField = this.filterField.children.find(
          (child) => child.name === fieldName
      );

      if (changedField) {
        const childTypes = this.getChildFields(changedField.usageType);
        for (let childType of childTypes) {
          const childField = this.filterField.children.find(
              (child) => child.usageType === childType
          );
          if (childField && this.filtersData[childField.name]) {
            this.filtersData[childField.name] = null;
          }
        }
      }
    },
    getChildFields(modelFieldType) {
      const index = this.placeFieldLevelTypes.indexOf(modelFieldType);
      if (index === -1 || index === this.placeFieldLevelTypes.length - 1) {
        return [];
      }
      return this.placeFieldLevelTypes.slice(index + 1);
    },
    fetchDisplayNameFromVuex(model, id) {
      let result = "PlaceholderName";
      const data = model.query().whereId(id).first();
      result = data[this.title(model).name];
      return result;
    },
    title(model) {
      const computedAttrs = QuickListsHelpers.computedAttrs(model);
      const result = computedAttrs.find((header) => header.name !== "id");
      return result;
    },
    filterParentName(modelField) {
      const parentType = this.parentRelationships[modelField.usageType];
      let filterParentName = null;
      if (parentType) {
        const parent = this.filterField.children.find(
            (field) => field.usageType == parentType
        );
        if (parent) {
          filterParentName = parent.name;
        }
      }
      return filterParentName;
    },
    getFilters(modelField) {
      const filterParentName = this.filterParentName(modelField);
      const result = this.modelValue[filterParentName]
          ? {
            parent_id: this.modelValue[filterParentName],
          }
          : {};
      return JSON.stringify(result);
    },
  },
  watch: {
    filtersData: {
      handler(newVal) {
        this.$emit("update:modelValue", newVal);
      },
      deep: true,
    },
  },
  mounted() {
    this.filtersData = this.modelValue;
  },
};
</script>

<style scoped></style>
