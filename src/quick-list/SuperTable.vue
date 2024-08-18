<template>
  <div>
    <div v-if="canCreateComputed && canEdit && !hideCreate && !isForSelectingRelation" class="">
      <template v-if="!!$slots.create">
        <slot name="create" />
      </template>
      <template v-else>
        <CreateButton
            v-if="superOptions.model.rules.creatable()"
            :modelFields="modelFields"
            @createItem="createItem"
            :model="model"
            :superOptions="superOptions"
            :template="templateForm"
            :createButtonText="createButtonText"
        />
      </template>

      <template v-if="canEdit">
        <q-dialog
            v-model="createItemData.showModal"
            @update:modelValue="formServerErrors = {};"
        >
          <!--:parentKeyValuePair="parentKeyValuePair"-->
          <CreateEditForm
              titlePrefix="New"
              v-if="createItemData.showModal"
              v-model="createItemData.data"
              @submit="createItemSubmit"
              @cancel="createItemData.showModal = false; formServerErrors = {};"
              :superOptions="superOptions"
              style="width: 700px; max-width: 80vw;"
              :template="templateForm"
              :formServerErrors="formServerErrors"
          />
        </q-dialog>

        <template v-if="superOptions.canEdit">
          <q-dialog
              v-model="editItemData.showModal"
              @update:modelValue="formServerErrors = {};"
          >
            <CreateEditForm
                titlePrefix="Edit"
                v-if="editItemData.showModal"
                v-model="editItemData.data"
                @submit="editItemSubmit"
                @cancel="editItemData.showModal = false; formServerErrors = {};"
                :superOptions="superOptions"
                :template="templateForm"
                style="width: 700px; max-width: 80vw;"
                :formServerErrors="formServerErrors"
            />
          </q-dialog>

          <q-dialog v-model="deleteItemData.showModal" >
            <q-card style="width: 500px; max-width: 80vw;">
              <q-card-section class="q-pt-md q-pb-md q-pl-md q-pr-md">
                <div class="text-h6">Delete Item</div>
              </q-card-section>
              <q-card-section>
                <p>Are you sure you want to delete this item?</p>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn @click="deleteItemData.showModal = false" flat>Cancel</q-btn>
                <q-btn @click="deleteItemSubmit" color="negative" flat>Delete</q-btn>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </template>
      </template>
    </div>
    <template v-if="!justCreateButton">

      <template v-if="isForSelectingRelation">
        <!--<SuperTableList-->
        <!--    :items="items"-->
        <!--    :modelValue="modelValue"-->
        <!--    @update:modelValue="clickRow"-->
        <!--    :superOptions="superOptions"-->
        <!--/>-->
        <SuperSelect
            :forcedFilters="forcedFilters"
            :readonly="disabled"
            :allowAll="allowAll"
            dense
            :hideLabel="hideLabel"
            :page="options.page"
            @update:page="pageUpdate"
            :maxPages="maxPages"
            @click="activateAndFetchData"
            :items="items"
            :loading="loading"
            :rules="rules"
            :modelValue="+modelValue"
            @update:modelValue="clickRow"
            :model="model"
            :modelField="modelField"
            :activated="activated"
            @search="search"
            :errorMessage="errorMessage"
        >
          <CreateButton
              v-if="superOptions.model.rules.creatable() && canCreateComputed"
              :modelFields="modelFields"
              @createItem="createItem"
              :model="model"
              :superOptions="superOptions"
              :template="templateForm"
              :createButtonText="createButtonText"
          />
        </SuperSelect>

        <!--:key="filterInput.name"-->
        <!--:model="filterInput.meta.field.parent"-->
        <!--:modelField="filterInput"-->
        <!--v-model="filters[filterInput.name]"-->
      </template>
      <template v-else>
        <template v-if="shouldWeShowTopBar()">
          <div class="q-px-sm q-mt-md">

            <DestructableExpansionPanels
                :destroy="!quickListsIsMobile"
                title="Settings"
            >
              <div class="row items-center wrap">
                <template v-if="!viewAs.hide">
                  <div class="q-mr-sm">
                    <q-select
                        style="width: 200px"
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
                        emit-value
                        map-options
                        dense
                        class="col-grow "
                        filled
                        :rules="[() => true]"
                    />
                  </div>
                </template>
                <template
                    v-for="filterInput of filterInputs"
                    :key="filterInput.name"
                >
                  <template v-if="typeof filters[filterInput.name] !== 'undefined' && (allowedFilters==null || allowedFilters.includes(filterInput.name))">
                    <template
                        v-if="filterInput.usageType.startsWith('relForeignKey')"
                    >
                      <!--<SuperSelect-->
                      <!--    allowAll-->
                      <!--    :key="filterInput.name"-->
                      <!--    :modelField="filterInput"-->
                      <!--    v-model="filters[filterInput.name]"-->
                      <!--    :model="filterInput.meta.field.parent"-->
                      <!--    class="q-ma-sm col-grow"-->
                      <!--    dense-->
                      <!--    :user="use"-->


                      <!--    :page="options.page"-->
                      <!--    @update:page="pageUpdate"-->
                      <!--    :maxPages="maxPages"-->
                      <!--    @click="activateAndFetchData"-->
                      <!--    :items="items"-->
                      <!--    :loading="loading"-->
                      <!--    :rules="rules"-->
                      <!--/>-->

                      <!--<RelationComponent-->
                      <!--  :modelField="filterInput"-->
                      <!--  v-model="filters[filterInput.name].value"-->

                      <!--  :page="options.page"-->
                      <!--  @update:page="pageUpdate"-->
                      <!--  :maxPages="maxPages"-->
                      <!--  @click="activateAndFetchData"-->
                      <!--  :items="items"-->
                      <!--  :loading="loading"-->
                      <!--  :rules="rules"-->
                      <!--/>-->
                      <SuperTable
                          :isForSelectingRelation="true"
                          :canEdit="false"
                          v-model="filters[filterInput.name]"
                          :model="filterInput.meta.field.parent"
                          :rules="[() => true]"
                          :modelField="filterInput"
                          class="q-mr-sm"

                      />
                      <!--v-model="filters[filterInput.name].value"-->
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
                      />
                    </template>
                  </template>
                </template>
              </div>
            </DestructableExpansionPanels>
          </div>
        </template>
        <div class="">
          <template v-if="activeTab == 'table'">
            <SuperTableTable
                :items="items"
                :loading="loading"
                @clickRow="clickRow"
                :templateListTable="templateListTable"
                :hidePagination="hidePagination"
                :excludedCols="excludedCols"
                :model="model"
                :displayMapField="displayMapField"
                :canEdit="canEdit"
                @editItem="editItem"
                @deleteItem="deleteItem"
            />
            <!--:superOptions="superOptions"-->
            <!--:itemsLength="itemsLength"-->
            <!--@clickRow="clickRow"-->
            <!--:pagination="options"-->
            <!--@update:pagination="updatePagination"-->
            <q-pagination
                v-if="!hidePagination"
                v-model="options.page"
                @update:modelValue="pageUpdate"
                :max="maxPages"
                input
            />
            <!--@update:rows-per-page="updateRowsPerPage"-->
          </template>
          <template v-if="activeTab == 'grid'">
            <div class="">
              <SuperTableGrid
                  :items="items"
                  @clickRow="clickRow"
                  :superOptions="superOptions"
                  :unClickable="unClickable"
                  :templateListGrid="templateListGrid"
                  @editItem="editItem"
                  @deleteItem="deleteItem"
              />
            </div>
          </template>
          <template v-if="activeTab == 'map'">
            <SuperTableMap
                :mapHeaders="mapHeaders"
                :items="items"
                @clickRow="clickRow"
                :superOptions="superOptions"
                @editItem="editItem"
                @deleteItem="deleteItem"
            />
          </template>
          <template v-if="activeTab == 'calendar'">
            <SuperTableCalendar
                :items="items"
                @clickRow="clickRow"
                :superOptions="superOptions"
                @editItem="editItem"
                @deleteItem="deleteItem"
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import moment from "moment";
import "moment-timezone";
// import CreateEditForm from "./CreateEditForm.vue";
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
import RelationComponent from "./RelationComponent.vue";

import { defineAsyncComponent } from 'vue'
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import SearchGooglePlace from "./SearchGooglePlace.vue";

const AsyncComponentCreateEditForm = defineAsyncComponent(() =>
    import('./CreateEditForm.vue')
);
const AsyncComponentSuperTable = defineAsyncComponent(() =>
    import('./SuperTable.vue')
);

export default {
  name: "SuperTable",
  components: {
    SearchGooglePlace,
    RecordFieldsForDisplayGeneric,
    RelationComponent,
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
    CreateEditForm: AsyncComponentCreateEditForm,
    SuperTable: AsyncComponentSuperTable,
  },
  props: {
    justCreateButton: {
      type: Boolean,
      default: false,
    },
    createButtonText: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    allowedFilters: {
      type: Array,
      default: null,
    },
    allowAll: {
      type: Boolean,
      default: false,
    },
    hideLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    templateForm: {
      type: Object,
      default() {
        return {};
      },
    },
    viewAs: {
      type: Object,
      default() {
        return {
          hide: false,
          default: "table"
        };
      },
    },
    hideCreate: {
      type: Boolean,
      default() {
        return false;
      },
    },
    forcedFilters: {
      type: Object,
      default() {
        return {};
      },
    },
    templateListTable: {
      type: Object,
      default() {
        return {};
      },
    },
    templateListGrid: {
      type: Object,
      default() {
        return {};
      },
    },
    model: {
      type: [Object, Function],
      required: true,
    },
    hidePagination: {
      type: Boolean,
      default() {
        return false;
      },
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
      type: [Number, Object, String],
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
    unClickable: {
      type: Boolean,
      default() {
        return false;
      },
    },
    // canEdit: {
    //   type: Boolean,
    //   default() {
    //     return false;
    //   },
    // },
    parentKeyValuePair: {
      type: Object,
      default() {
        return {};
      },
    },
    createPayloadExtras: {
      type: Object,
      default() {
        return {};
      },
    },
    relationships: {
      type: Array,
      default() {
        return [];
      },
    },
    fetchFlags: {
      type: Object,
      default() {
        return {};
      },
    },
    defaultViewModeProp: {
      type: String,
      default() {
        return "";
      },
    },
    rules: {
      type: Array,
      default() {
        return [() => true];
      },
    },
    modelField: {
      type: Object,
      default: () => ({}),
    },
    errorMessage: {
      type: String,
      default() {
        return null;
      },
    },
  },
  data() {
    return {
      formServerErrors: {},
      deleteItemData: {
        showModal: false,
        data: null,
      },
      editItemData: {
        showModal: false,
        data: null,
      },
      years: Array.from(
          {length: 5},
          (_, index) => new Date().getFullYear() - index,
      ), // last 5 years including this year
      itemsLength: 1,
      activated: false,
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
      items: [],
      // activeTab: {
      //   "label": "Table",
      //   "value": "table"
      // },
      activeTab: "table",
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
    parentField() {
      const result = this.superOptions.modelFields.find((field) => {
        return field.name == this.parentKeyValuePair.parentFKey
      })
      return result
    },
    canCreateComputed() {
      if (this.parentField && typeof this.parentField.fieldExtras.linkablesRule === 'function') {
        const linkablesRule =  this.parentField.fieldExtras.linkablesRule();
        if (linkablesRule[this.model.primaryKey] && this.parentKeyValuePair.parentFVal){
          const array = linkablesRule[this.model.primaryKey].split(",").map(Number);
          if (!array.includes(this.parentKeyValuePair.parentFVal)){
            return false
          }
        }
      }
      return true
    },
    superOptions() {
      return {
        headers: this.headers,
        modelFields: this.modelFields,
        displayMapField: this.displayMapField,
        model: this.model,
        canEdit: this.canEdit,
      }
    },
    excludedCols() {
      let result = [];
      if (this.parentKeyValuePair.parentFKey) {
        result = [this.parentKeyValuePair.parentFKey];
      }
      return result;
    },
    canEdit() {
      const result = this.model.rules.creatable()
      return result;
    },
    filtersComp() {
      const result = {
        ...this.filters,
        ...this.forcedFilters,
      };
      if (this.parentKeyValuePair.parentFKey && this.parentKeyValuePair.parentFVal) {
        result[this.parentKeyValuePair.parentFKey] = this.parentKeyValuePair.parentFVal;
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
    // itemsQueried() {
    //   const result = this.model
    //       .query()
    //       .where((item) => {
    //         return this.quickListsGetIfMatchesAllChecks(item, this.filtersComp);
    //       })
    //       .withAll()
    //       .orderBy(`${this.model.primaryKey}`, "desc")
    //       .get();
    //   return result;
    // },
    pKey() {
      return this.model.primaryKey;
    },
    maxPages() {
      return Math.ceil(this.itemsLength / this.options.itemsPerPage);
    },
  },
  methods: {
    shouldWeShowTopBar() {
      let result = true
      if (
          !this.viewAs.hide &&
          (
              this.filterInputs.length &&
              (
                  this.allowedFilters == null ||
                  this.filterInputs.some(
                      filterInput =>  this.allowedFilters.includes(filterInput.name)
                  )
              )
          )
      ){
        result = true
      }
      return result
    },
    search(searchTerm) {
      this.filters[this.model.titleKey] = searchTerm
      this.fetchData();
    },
    deleteItem(item) {

      this.$emit("deleteItem", item);

      this.deleteItemData.data = item;
      this.deleteItemData.showModal = true;
    },
    deleteItemSubmit() {
      this.superOptions.model.Delete(this.deleteItemData.data.id).then(() => {
        this.fetchData();
      });
      this.deleteItemData.showModal = false;
    },
    editItem(item) {
      this.$emit("editItem", item);

      this.editItemData.data = {...item};
      this.editItemData.showModal = true;
    },
    editItemSubmit() {
      const payload = QuickListsHelpers.preparePayload(
          this.editItemData.data,
          this.superOptions.modelFields
      );

      this.superOptions.model.Update(
          payload,
          [],
          {},
          {
            'Content-Type': 'multipart/form-data'
          }
      )
          .then(() => {
            this.fetchData();
            this.editItemData.showModal = false;
            this.formServerErrors = {};
          })
          .catch((err) => {
            this.formServerErrors = err.response.data;
          });
    },
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
    clickRow(pVal, item) {

      if (this.isForSelectingRelation) {
        this.highlightedRow = pVal;
      }
      // if (!this.isForSelectingRelation && typeof this.model.openRecord === 'function'){
      //   this.model.openRecord(item[this.pKey]);
      // }

      if (this.model.rules.readable(item)){
        this.$emit("clickRow", pVal, item, this.$router);
      }

      this.$emit("update:modelValue", pVal);
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


      let headers = {}
      const hasFileField = this.superOptions.modelFields.find((field) => field.usageType == "fileImageType");
      if (hasFileField){
        headers = {
          'Content-Type': 'multipart/form-data'
        }
      }

      this.model.Store(
          {
            ...payload,
            ...this.createPayloadExtras,
          },
          [],
          {},
          headers
      )
          .then(() => {

            // if (!inititalItemLength) {
            //   if (!this.loading) {
            //   }
            // }



            this.fetchData();

            // After handling, reset formData (if needed)
            this.createItemData.data = {};

            // Close the dialog after submission
            this.createItemData.showModal = false;
            this.formServerErrors = {};
          })
          .catch((err) => {
            this.formServerErrors = err.response.data;
          });

    },
    applyFilters(items, filters) {
      const groupedFilters = {};

      // Group filters by relation
      Object.keys(filters).forEach(filterKey => {
        const [relation, attr] = filterKey.split('.');
        if (!groupedFilters[relation]) {
          groupedFilters[relation] = {};
        }
        groupedFilters[relation][attr] = filters[filterKey];
      });

      return items.filter(item => {
        return Object.keys(groupedFilters).every(relation => {
          const relationFilters = groupedFilters[relation];
          if (!item[relation]) return false;
          return item[relation].some(relatedItem => {
            return Object.keys(relationFilters).every(attr => relatedItem[attr] === relationFilters[attr]);
          });
        });
      });
    },
    async fetchData() {
      if (!this.activated && this.isForSelectingRelation) return;

      this.loading = true;
      let rules = [];
      if (this.model.rules?.readables) {
        rules = this.model.rules.readables();
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
          this.relationships,
          {
            ...rules,
            ...flagsComputed,
            ...this.fetchFlags,
          },
          extraHeaderComputed,
          {
            page: this.options.page,
            limit: this.options.itemsPerPage,
            filters: this.filtersComp,
            clearPrimaryModelOnly: false,
          },
      );

      // this.items = this.applyFilters(response.response.data.data, this.filtersComp);
      // this.items = this.applyFilters(response.response.data.data, this.forcedFilters);
      this.items = response.response.data.data;
      // console.log("this.items")
      // console.log(this.items)
      // this.items = response.response.data.data

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
    activateAndFetchData() {
      if (!this.activated && !this.disabled) {
        this.activated = true;
        this.fetchData();
      }
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

        if (this.parentKeyValuePair.parentFKey && this.parentKeyValuePair.parentFVal) {
          this.createItemData.data[this.parentKeyValuePair.parentFKey] = this.parentKeyValuePair.parentFVal;
        }
      }
    },
  },
  mounted() {
    this.$emit('superTableMounted');

    this.activeTab = this.viewAs.default

    // if (this.quickListsIsMobile) {
    //   this.activeTab = "grid";
    // } else if (this.defaultViewModeProp !== "") {
    //   this.activeTab = this.defaultViewModeProp;
    // } else if (this.templateOverview?.defaultViewMode) {
    //   this.activeTab = this.templateOverview.defaultViewMode;
    // }

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
    if (this.activated || !this.isForSelectingRelation){
      if (!this.loading) {
        this.fetchData();
      }
    }
  },
};
</script>

<style lang="scss">
//.highlighted {
//  background-color: #f0f0f0;
//}


</style>
