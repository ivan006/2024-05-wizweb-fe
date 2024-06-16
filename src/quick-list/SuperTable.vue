<template>
  <div>
    <div v-if="canEdit" class="row items-center q-mb-md q-gutter-sm">
      <template v-if="!!$slots.create">
        <slot name="create" />
      </template>
      <template v-else>
        <CreateButton
            :modelFields="modelFields"
            @createItem="createItem"
            :model="model"
            :superOptions="{
            headers: headers,
            modelFields: modelFields,
            displayMapField: displayMapField,
            model: model,
            canEdit: canEdit,
            currentParentRel: currentParentRel,
            user: user,
          }"
        />
      </template>
    </div>
    <template v-if="isForSelectingRelation">
      <SuperTableList
          :items="items"
          :modelValue="modelValue"
          @update:modelValue="clickRow"
          :superOptions="{
          headers: headers,
          modelFields: modelFields,
          displayMapField: displayMapField,
          model: model,
          canEdit: canEdit,
          currentParentRel: currentParentRel,
          user: user,
        }"
      />
    </template>
    <template v-else>
      <DestructableExpansionPanels
          :destroy="!quickListsIsMobile"
          title="Settings"
      >
        <div class="row items-center wrap">
          <q-select
              style="width: 250px"
              :options="[
              { label: 'Table', value: 'table' },
              { label: 'Grid', value: 'grid' },
              { label: 'Map', value: 'map' },
              { label: 'Calendar', value: 'calendar' },
            ]"
              v-model="activeTab"
              label="View As"
              option-label="label"
              option-value="value"
              dense
              class="q-ma-sm col-grow"
              outlined
              :rules="[() => true]"
          />
          <template
              v-for="filterInput of filterInputs"
              :key="filterInput.name"
          >
            <template v-if="typeof filters[filterInput.name] !== 'undefined'">
              <template
                  v-if="filterInput.usageType.startsWith('relForeignKey')"
              >
                <SuperSelect
                    allowAll
                    :key="filterInput.name"
                    :modelField="filterInput"
                    v-model="filters[filterInput.name]"
                    :model="filterInput.meta.relatedModel"
                    class="q-ma-sm col-grow"
                    dense
                    :user="user"
                />
              </template>
              <template v-if="filterInput.usageType == 'timeRangeStart'">
                <FilterTime
                    :key="filterInput.name"
                    :modelField="filterInput"
                    v-model="filters[filterInput.name].value"
                    class="q-ma-sm col-grow"
                />
              </template>
            </template>
            <template v-else>
              <template v-if="filterInput.usageType == 'mapFilter'">
                <FilterPlace
                    :key="filterInput.name"
                    :filterField="filterInput"
                    v-model="filters"
                    class="q-ma-sm col-grow"
                    :user="user"
                />
              </template>
            </template>
          </template>
        </div>
      </DestructableExpansionPanels>
      <div class="q-my-md">
        <template v-if="activeTab.value == 'table'">
          <SuperTableTable
              :items="items"
              :superOptions="{
                headers: headers,
                modelFields: modelFields,
                displayMapField: displayMapField,
                model: model,
                canEdit: canEdit,
                currentParentRel: currentParentRel,
                user: user,
              }"
          />
          <!--:itemsLength="itemsLength"-->
          <!--@clickRow="clickRow"-->
          <!--:pagination="options"-->
          <!--@update:pagination="updatePagination"-->
          <q-pagination
              v-model="options.page"
              @update:modelValue="pageUpdate"
              :max="maxPages"
              input
          />
          <!--@update:rows-per-page="updateRowsPerPage"-->
        </template>
        <template v-if="activeTab.value == 'grid'">
          <div class="q-my-md">
            <SuperTableGrid
                :items="items"
                @clickRow="clickRow"
                :superOptions="{
                headers: headers,
                modelFields: modelFields,
                displayMapField: displayMapField,
                model: model,
                canEdit: canEdit,
                currentParentRel: currentParentRel,
                user: user,
              }"
            />
          </div>
        </template>
        <template v-if="activeTab.value == 'map'">
          <SuperTableMap
              :mapHeaders="mapHeaders"
              :items="items"
              @clickRow="clickRow"
              :superOptions="{
              headers: headers,
              modelFields: modelFields,
              displayMapField: displayMapField,
              model: model,
              canEdit: canEdit,
              currentParentRel: currentParentRel,
              user: user,
            }"
          />
        </template>
        <template v-if="activeTab.value == 'calendar'">
          <SuperTableCalendar
              :items="items"
              @clickRow="clickRow"
              :superOptions="{
              headers: headers,
              modelFields: modelFields,
              displayMapField: displayMapField,
              model: model,
              canEdit: canEdit,
              currentParentRel: currentParentRel,
              user: user,
            }"
          />
        </template>
      </div>
    </template>
    <template v-if="canEdit">
      <q-dialog v-model="createItemData.showModal" max-width="800px">
        <CreateEditForm
            title="Create Item"
            v-if="createItemData.showModal"
            v-model="createItemData.data"
            @submit="createItemSubmit"
            @cancel="createItemData.showModal = false"
            :superOptions="{
            headers: headers,
            modelFields: modelFields,
            displayMapField: displayMapField,
            model: model,
            canEdit: canEdit,
            currentParentRel: currentParentRel,
            user: user,
          }"
        />
      </q-dialog>
    </template>
  </div>
</template>

<script>
import moment from "moment";
import "moment-timezone";
import CreateEditForm from "./CreateEditForm.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import SuperTableCalendar from "./SuperTableCalendar.vue";
import SuperTableGrid from "./SuperTableGrid.vue";
import SuperTableTable from "./SuperTableTable.vue";
import SuperTableMap from "./SuperTableMap.vue";
import SuperTableList from "./SuperTableList.vue";
import SuperSelect from "./SuperSelect.vue";
import FilterTime from "./FilterTime.vue";
import FilterPlace from "./FilterPlace.vue";
import DestructableExpansionPanels from "./DestructableExpansionPanels.vue";
import CreateButton from "./CreateButton.vue";

export default {
  name: "SuperTable",
  components: {
    CreateButton,
    DestructableExpansionPanels,
    FilterPlace,
    FilterTime,
    SuperSelect,
    SuperTableList,
    SuperTableMap,
    SuperTableTable,
    SuperTableGrid,
    SuperTableCalendar,
    CreateEditForm,
  },
  props: {
    forcedFilters: {
      type: Object,
      default() {
        return {};
      },
    },
    user: {
      type: Object,
      default() {
        return {};
      },
    },
    model: {
      type: [Object, Function],
      required: true,
    },
    displayMapField: {
      type: Boolean,
      default() {
        return false;
      },
    },
    isForSelectingRelation: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modelValue: {
      type: [Number, Object],
      default() {
        return null;
      },
    },
    showMap: {
      type: Boolean,
      default() {
        return false;
      },
    },
    canEdit: {
      type: Boolean,
      default() {
        return false;
      },
    },
    currentParentRel: {
      type: Object,
      default() {
        return null;
      },
    },
    defaultViewModeProp: {
      type: String,
      default() {
        return "";
      },
    },
  },
  data() {
    return {
      years: Array.from(
          {length: 5},
          (_, index) => new Date().getFullYear() - index,
      ), // last 5 years including this year
      itemsLength: 1,
      loading: false,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        groupBy: [],
      },
      createItemData: {
        showModal: false,
        data: {},
      },
      highlightedRow: null,
      filters: {},
      activeTab: {
        "label": "Table",
        "value": "table"
      },
    };
  },
  computed: {
    optionsComputed: {
      get() {
        return this.options;
      },
      set(value) {
        if (!this.loading) {
          this.fetchData();
        }
        this.options = value;
      },
    },
    excludedCols() {
      let result = [];
      if (this.currentParentRel?.currentParentRecord) {
        result = [
          this.currentParentRel.currentParentRecord.foreignKeyToParentRecord,
        ];
      }
      return result;
    },
    filtersComp() {
      const result = {
        ...this.filters,
        ...this.forcedFilters,
      };
      if (
          this.currentParentRel?.currentParentRecord &&
          this.currentParentRel.currentParentRecord.item
      ) {
        const pKey = this.currentParentRel.currentParentRecord.model.primaryKey;
        result[
            this.currentParentRel.currentParentRecord.foreignKeyToParentRecord
            ] = this.currentParentRel.currentParentRecord.item[pKey];
      }
      return result;
    },
    quickListsIsMobile() {
      return QuickListsHelpers.quickListsIsMobile();
    },
    filterInputs() {
      const data = this.modelFields;

      const result = [];
      for (const item of data) {
        if (
            item.usageType.startsWith("relForeignKeyNormal") ||
            item.usageType == "timeRangeStart"
        ) {
          result.push(item);
        } else if (item.usageType == "relForeignKeyMapExtraRelSublocality") {
          const children = data.filter((item) =>
              item.usageType.startsWith("relForeignKeyMapExtraRel"),
          );

          result.push({
            label: "Place",
            name: "Place",
            usageType: "mapFilter",
            dataType: "normal",
            children: children,
          });
        }
      }
      return result;
    },
    headers() {
      const result = QuickListsHelpers.SupaerTableHeaders(
          this.model,
          this.excludedCols,
          this.canEdit,
          this.displayMapField,
      );
      return result;
    },
    mapHeaders() {
      const result = QuickListsHelpers.SupaerTableHeaders(
          this.model,
          this.excludedCols,
          this.canEdit,
          true,
      );
      return result;
    },
    modelFields() {
      const result = QuickListsHelpers.computedAttrs(
          this.model,
          this.excludedCols,
      );
      return result;
    },
    items() {
      const result = this.model
          .query()
          .where((item) => {
            return this.quickListsGetIfMatchesAllChecks(item, this.filtersComp);
          })
          .withAll()
          .orderBy(`${this.model.primaryKey}`, "desc")
          .get();
      return result;
    },
    pKey() {
      return this.model.primaryKey;
    },
    maxPages() {
      return Math.ceil(this.itemsLength / this.options.itemsPerPage);
    },
  },
  methods: {
    pageUpdate(page) {
      this.options = {
        ...this.options,
        page: page,
        // itemsPerPage: page.rowsPerPage,
        // sortBy: page.sortBy,
        // descending: page.descending,
      };
      this.fetchData();
    },
    updatePagination(pagination) {
      this.options = {
        ...this.options,
        page: pagination.page,
        itemsPerPage: pagination.rowsPerPage,
        sortBy: pagination.sortBy,
        descending: pagination.descending,
      };
      this.fetchData();
    },
    // updateRowsPerPage(rowsPerPage) {
    //   this.options = {
    //     ...this.options,
    //     itemsPerPage: rowsPerPage,
    //     page: 1,
    //   };
    //   this.fetchData();
    // },
    quickListsGetIfMatchesAllChecks(item, filters) {
      return QuickListsHelpers.quickListsGetIfMatchesAllChecks(item, filters);
    },
    openRecord(e) {
      this.$emit("openRecord", e);
    },
    formatTimestamp(timestamp) {
      if (timestamp) {
        const timezone = "Africa/Johannesburg"; // replace with desired timezone
        const formattedDateInTimeZone = moment
            .tz(timestamp, "YYYY-MM-DDTHH:mm:ss.SSSSSSZ", "UTC")
            .tz(timezone)
            .format("dddd, MMMM D, YYYY h:mm A");
        return formattedDateInTimeZone;
      } else {
        return null;
      }
    },
    createNewInstance() {
      return new this.model();
    },
    clickRow(item) {
      if (this.isForSelectingRelation) {
        this.highlightedRow = item.id;
      }
      this.model.openRecord(item[this.pKey]);

      this.$emit("update:modelValue", item);
    },
    createItem() {
      this.createItemData.showModal = true;
    },
    createItemSubmit() {
      let payload = QuickListsHelpers.preparePayload(
          this.createItemData.data,
          this.modelFields,
      );

      delete payload.id;

      const inititalItemLength = this.items.length;
      this.model.Store(payload).then(() => {
        if (!inititalItemLength) {
          if (!this.loading) {
            this.fetchData();
          }
        }
      });

      // After handling, reset formData (if needed)
      this.createItemData.data = {};

      // Close the dialog after submission
      this.createItemData.showModal = false;
    },
    async fetchData() {
      this.loading = true;
      let rules = [];
      if (this.model.rules?.readables) {
        rules = this.model.rules.readables(this.user);
      }

      let extraHeaderComputed = {};
      let flagsComputed = {};
      if (this.model.adapator == "supabase") {
        extraHeaderComputed = {
          Prefer: "count=exact",
        };
        flagsComputed = {
          order: "id.desc",
        };
      } else if (this.model.adapator == "laravel") {
        extraHeaderComputed = {};
        flagsComputed = {
          sort: `-${this.model.primaryKey}`,
          per_page: this.options.itemsPerPage,
          page: this.options.page,
        };
      }

      const response = await this.model.FetchAll(
          [],
          {
            ...rules,
            ...flagsComputed,
          },
          extraHeaderComputed,
          {
            page: this.options.page,
            limit: this.options.itemsPerPage,
            filters: this.filtersComp,
            clearPrimaryModelOnly: true,
          },
      );

      this.loading = false;
      let count = 0;

      if (this.model.adapator == "supabase") {
        if (response?.response?.headers?.["content-range"]) {
          const contentRange = response?.response?.headers?.["content-range"];
          count = contentRange.split("/")[1];
        }
      } else if (this.model.adapator == "laravel") {
        count = response.response.data.total;
      }
      this.itemsLength = count; // Assuming your API returns a total count
    },
  },
  watch: {
    filters: {
      handler() {
        if (!this.loading) {
          this.fetchData();
        }
      },
      deep: true,
    },
    "createItemData.showModal"(arg) {
      if (arg) {
        this.createItemData.data = this.createNewInstance();

        if (this.currentParentRel?.currentParentRecord) {
          this.createItemData.data[
              this.currentParentRel.currentParentRecord.foreignKeyToParentRecord
              ] = this.currentParentRel.currentParentRecord.item.id;
        }
      }
    },
  },
  mounted() {
    if (this.quickListsIsMobile) {
      this.activeTab = "grid";
    } else if (this.defaultViewModeProp !== "") {
      this.activeTab = this.defaultViewModeProp;
    } else if (this.model?.displayMapFull?.defaultViewMode) {
      this.activeTab = this.model.displayMapFull.defaultViewMode;
    }

    for (const modelField of this.modelFields) {
      if (
          modelField.usageType.startsWith("relForeignKey") ||
          modelField.dataType.startsWith("mapExtraRel")
      ) {
        this.filters[modelField.name] = null;
      } else if (modelField.usageType == "timeRangeStart") {
        this.filters[modelField.name] = {
          value: null,
          usageType: "timeRangeStart",
        };
      }
    }
    if (!this.loading) {
      this.fetchData();
    }
  },
};
</script>

<style lang="scss">
//.highlighted {
//  background-color: #f0f0f0;
//}


</style>
