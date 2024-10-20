<template>
  <div>
    <div
        v-if="canCreateComputed && canEdit && !hideCreate && !isForSelectingRelation"
         class="q-mb-md"
    >
      <template v-if="!!$slots.create">
        <slot name="create" />
      </template>
      <template v-else>
        <CreateButton
            :class="noBorder ? 'q-ml-md' : ''"
            v-if="superOptions.model.rules.creatable()"
            :modelFields="modelFields"
            @createItem="createItem"
            :model="model"
            :superOptions="superOptions"
            :template="templateForm"
            :createButtonText="createButtonText"
        />
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
            :modelValue="modelValue"
            @update:modelValue="clickRow"
            :model="model"
            :modelField="modelField"
            :activated="activated"
            @search="doSearch"
            :errorMessage="errorMessage"
            :hideBottomSpace="selectHideBottomSpace"
        >
          <CreateButton
              v-if="superOptions.model.rules.creatable() && canCreateComputed && !hideCreate"
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
          <div class="">

            <DestructableExpansionPanels
                :destroy="!quickListsIsMobile"
                title="Settings"
            >
              <div class="row items-center wrap">
                <template v-if="viewAs.show.length">
                  <div class="q-mr-sm">
                    <!--<q-select-->
                    <!--    style="width: 200px"-->
                    <!--    :options="tabOptions"-->
                    <!--    v-model="activeTab"-->
                    <!--    label="View As"-->
                    <!--    option-label="label"-->
                    <!--    option-value="value"-->
                    <!--    emit-value-->
                    <!--    map-options-->
                    <!--    dense-->
                    <!--    class="col-grow "-->
                    <!--    filled-->
                    <!--    :rules="[() => true]"-->
                    <!--/>-->

                    <q-btn-toggle
                        v-model="activeTab"
                        toggle-color="primary"
                        :options="tabOptions"
                        style="margin-bottom: 20px;"
                        unelevated
                        text-color="grey-8"
                        color="grey-3"
                    />


                    <!--<q-btn-toggle-->
                    <!--    v-if="activeTab === 'calendar'"-->
                    <!--    class="q-ml-sm"-->
                    <!--    v-model="calendarMode"-->
                    <!--    toggle-color="primary"-->
                    <!--    :options="[-->
                    <!--      {label: 'Timeline', value: 'Timeline'},-->
                    <!--      {label: 'List', value: 'List'},-->
                    <!--    ]"-->
                    <!--    unelevated-->
                    <!--    text-color="grey-8"-->
                    <!--    color="grey-3"-->
                    <!--    style="margin-bottom: 20px;"-->
                    <!--/>-->
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
                      <div style="min-width: 200px;">

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
                      </div>
                    </template>
                    <template v-if="filterInput.usageType == 'timeRangeStart'">

                      <FilterTime
                          :key="filterInput.name"
                          :modelField="filterInput"
                          v-model="filters[filterInput.name].value"
                          class="q-mr-sm col-grow"
                          style="max-width: 200px;"
                      />
                    </template>
                  </template>
                  <template v-else>
                    <template v-if="filterInput.usageType == 'mapFilter'">
                      <FilterPlace
                          :key="filterInput.name"
                          :filterField="filterInput"
                          v-model="filters"
                          class="q-mr-sm col-grow"
                          style="max-width: 200px;"
                      />
                    </template>
                  </template>
                </template>
                <q-input
                    v-if="this.model.titleKey !== this.model.primaryKey"
                    v-model="search"
                    :error="false"
                    :error-message="''"
                    label="Search"
                    dense
                    filled
                ></q-input>
                <template v-if="Object.keys(downloadables).includes('csv')">
                  <q-btn
                      icon="download"
                      label="CSV"
                      @click="downloadCsv"
                      class="q-mb-md q-ml-md text-grey-8"
                      filled
                      unelevated
                      :style="{ backgroundColor: 'var(--q-color-grey-2)', 'margin-left': 'auto'}"
                  />
                </template>
                <template v-if="Object.keys(downloadables).includes('pdf')">
                  <q-btn
                      icon="download"
                      label="Pdf"
                      @click="downloadPdf()"
                      class="q-mb-md q-ml-md text-grey-8"
                      filled
                      unelevated
                      :style="{ backgroundColor: 'var(--q-color-grey-2)' }"
                  />
                  <div
                      style="display: none"
                  >
                    <PdfTemplate
                        :id="`pdfBody${toHtmlIdSafeString(downloadables.pdf?.title)}`"
                        :options="downloadables.pdf"
                        :items="itemsForExport"
                    />

                    <template v-if="downloadables.pdf.header">
                      <div
                          :id="`pdfHeader${toHtmlIdSafeString(downloadables.pdf?.title)}`"
                      >
                        <!--<div style="width: 793px;">-->
                        <!--</div>-->
                        <component
                            :is="defineAsyncComponent(downloadables.pdf?.header)"
                        />
                      </div>
                    </template>

                    <template v-if="downloadables.pdf.footer">
                      <div
                          :id="`pdfFooter${toHtmlIdSafeString(downloadables.pdf?.title)}`"
                      >
                        <!--<div style="width: 793px;">-->
                        <!--</div>-->
                        <component
                            :is="defineAsyncComponent(downloadables.pdf?.footer)"
                        />
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </DestructableExpansionPanels>
          </div>
        </template>
        <div class="">
          <template v-if="activeTab == 'table'">

            <div
            >
              <!--:id="`pdfBody${toHtmlIdSafeString(downloadables.pdf?.title)}`"-->
              <template v-if="!noBorder">
                <q-card class="">

                    <SuperTableTable
                        ref="SuperTableTableRef"
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
                </q-card>
              </template>
              <template v-else>

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
              </template>
            </div>
            <!--:superOptions="superOptions"-->
            <!--:itemsLength="itemsLength"-->
            <!--@clickRow="clickRow"-->
            <!--:pagination="options"-->
            <!--@update:pagination="updatePagination"-->
            <q-pagination
                :class="noBorder ? 'q-ml-md' : ''"
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
                  :excludedCols="excludedCols"
                  :loading="loading"
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
                :unClickable="unClickable"
                :templateListGrid="templateListGrid"
            />
          </template>
          <template v-if="activeTab == 'calendar'">

            <template v-if="!noBorder">
              <q-card class="q-pa-sm">

                <!--<SuperTableCalendarWrapper-->
                <!--    :startFieldName="startFieldName"-->
                <!--    :endFieldName="endFieldName"-->
                <!--    :items="items"-->
                <!--    @clickRow="clickRow"-->
                <!--    :superOptions="superOptions"-->
                <!--    @editItem="editItem"-->
                <!--    @deleteItem="deleteItem"-->
                <!--    :templateListGrid="templateListGrid"-->
                <!--    :templateListCalendar="templateListCalendar"-->
                <!--    :unClickable="unClickable"-->
                <!--    :loading="loading"-->
                <!--/>-->
                <!--&lt;!&ndash;:calendarMode="calendarMode"&ndash;&gt;-->

                <SuperCalendar
                    @clickRow="clickRow"
                    @editItem="editItem"
                    @deleteItem="deleteItem"
                    :loading="loading"
                    :mixedConfigs="[
                      {
                        templateListCalendar: templateListCalendar,
                        startFieldName: startFieldName,
                        endFieldName: endFieldName,
                        items: items,
                        superOptions: superOptions,
                        unClickable: unClickable,
                      }
                    ]"
                />
                <!--:calendarMode="calendarMode"-->
              </q-card>
            </template>
            <template v-else>
              <SuperCalendar
                  @clickRow="clickRow"
                  @editItem="editItem"
                  @deleteItem="deleteItem"
                  :loading="loading"
                  :mixedConfigs="[
                    {
                      templateListCalendar: templateListCalendar,
                      startFieldName: startFieldName,
                      endFieldName: endFieldName,
                      items: items,
                      superOptions: superOptions,
                      unClickable: unClickable,
                    }
                  ]"
              />
            </template>
          </template>
        </div>
      </template>
    </template>
    <CrudModal
        :templateForm="templateForm"
        @fetchData="fetchData"
        ref="CrudModalRef"
        :superOptions="superOptions"
        :parentKeyValuePair="parentKeyValuePair"
    />
  </div>
</template>

<script>
import moment from "moment";
import "moment-timezone";
// import CreateEditForm from "./CreateEditForm.vue";
import QuickListsHelpers from "./QuickListsHelpers";
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
import jsPDF from "jspdf";
import 'jspdf-autotable';
import PdfTemplate from "./PdfTemplate.vue";
import {Helpers} from "../index";
import SuperCalendar from "./SuperCalendar.vue";
import CrudModal from "./CrudModal.vue";
// import html2pdf from 'html2pdf.js';

const AsyncComponentCreateEditForm = defineAsyncComponent(() =>
    import('./CreateEditForm.vue')
);
const AsyncComponentSuperTable = defineAsyncComponent(() =>
    import('./SuperTable.vue')
);

export default {
  name: "SuperTable",
  components: {
    CrudModal,
    SuperCalendar,
    PdfTemplate,
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
    CreateEditForm: AsyncComponentCreateEditForm,
    SuperTable: AsyncComponentSuperTable,
  },
  props: {
    downloadables: {
      type: Object,
      default: {},
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
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
          show: [
              'table',
              'grid',
              'map',
              'calendar',
          ],
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
    templateListCalendar: {
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
    selectHideBottomSpace: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data() {
    return {
      // calendarMode: 'List',
      search: "",
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
    longField(){
      let longField = this.mapHeaders.find((field) => {
        return field.usageType == "mapExtraGeoLocLong";
      });
      return longField
    },
    startFieldName() {

      const result = Helpers.getFieldFromModelOrParent(this.superOptions.headers, 'timeRangeStart');
      return result
    },
    endFieldName() {
      const result = Helpers.getFieldFromModelOrParent(this.superOptions.headers, 'timeRangeEnd');
      return result
    },
    flattenedHeaders() {

      let result = [];
      if (this.templateListTable.length){
        for (const field of this.templateListTable) {

          const validField = this.superOptions.headers.find((header) => header.field === field.field);
          let addableField = {}

          if (typeof validField !== "undefined"){

            addableField = validField

            if (typeof field.label !== "undefined"){
              addableField.label = field.label
            }
            addableField.userConfig = field

          } else {

            let label = "";
            if (typeof field.label !== "undefined" && !field.hideLabel){
              label = field.label
            }

            let fieldName = "";
            if (typeof field.field !== "undefined"){
              fieldName = field.field
            }

            addableField = {
              align: "left",
              dataType: "attr",
              field: fieldName,
              label: label,
              meta: {},
              name: fieldName,
              sortable: fieldName.length ? true : false,
              usageType: "normal",
              userConfig: field
            }

          }

          result.push(addableField);
        }

      } else {
        for (const header of this.superOptions.headers) {
          result.push(header);
          if (header.headerParentFields) {
            for (const childHeader of header.headerParentFields) {
              result.push({
                // isChildOf: header,
                ...childHeader,
                userConfig: {}
              });
            }
          }
        }
      }

      return result;
    },
    itemsForExport() {
      const result = []
      let compItem = {}
      for (const item of this.items) {
        compItem = {}
        for (const header of this.flattenedHeaders) {
          if (header.userConfig && header.userConfig.type === 'function'){
            compItem[header.label] = header.userConfig.function(item)
          } else if(header.usageType) {
            if (
                header.usageType === 'readOnlyTimestampType' ||
                header.usageType === 'timestampType' ||
                header.usageType === 'timeRangeStart' ||
                header.usageType === 'timeRangeEnd'
            ){
              compItem[header.label] = this.formatTimestamp(item[header.field])
            } else if (header.usageType.startsWith('relLookup')) {
              if (item?.[header.field]?.[header.meta.lookupDisplayField]) {
                compItem[header.label] = item?.[header.field]?.[header.meta.lookupDisplayField]
              }
            } else if (
                !header.usageType.startsWith('relChildren') &&
                item[header.field]
            ){
              compItem[header.label] = this.truncateStr(item[header.field])
            }
          }
        }
        result.push(compItem)
      }
      return result
    },
    tabOptions() {
      let result = []
      // let result = [
      //   { label: 'Table', value: 'table' },
      //   { label: 'Grid', value: 'grid' },
      //   { label: 'Map', value: 'map' },
      //   { label: 'Calendar', value: 'calendar' },
      // ]
      if(this.viewAs.show.includes('grid')){
        result.push({ label: 'Grid', value: 'grid' })
      }
      if(this.viewAs.show.includes('map') && this.longField){
        result.push({ label: 'Map', value: 'map' })
      }
      if(this.viewAs.show.includes('calendar') && this.startFieldName){
        result.push({ label: 'Calendar', value: 'calendar' })
      }
      if(this.viewAs.show.includes('table')){
        result.push({ label: 'Table', value: 'table' })
      }
      return result
    },
    // optionsComputed: {
    //   get() {
    //     return this.options;
    //   },
    //   set(value) {
    //     if (!this.loading) {
    //       this.fetchData();
    //     }
    //     this.options = value;
    //   },
    // },
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
    createItem() {
      this.$refs.CrudModalRef.createItem()
    },
    deleteItem(item) {
      this.$emit("deleteItem", item);
      this.$refs.CrudModalRef.deleteItem(item)
    },
    editItem(item) {
      this.$emit("editItem", item);
      this.$refs.CrudModalRef.editItem(item)
    },
    defineAsyncComponent,
    downloadCsv() {
      const csvData = this.convertToCsv();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${this.downloadables.csv?.title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    // downloadPdf() {
    //   const doc = new jsPDF();
    //
    //   // Extract headers and rows directly without additional formatting
    //   const tableColumn = Object.keys(this.itemsForExport[0]);
    //   const tableRows = this.itemsForExport.map(row => Object.values(row));
    //
    //   // Generate PDF table using autoTable plugin
    //   doc.autoTable({
    //     head: [tableColumn],
    //     body: tableRows
    //   });
    //
    //   // Save the PDF file
    //   doc.save(`${this.downloadables.pdf}.pdf`);
    // },import html2pdf from 'html2pdf.js';

    downloadPdf() {

      const bodyElement = document.querySelector(
          `#pdfBody${this.toHtmlIdSafeString(this.downloadables.pdf?.title)}`
      );
      const headerElement = document.querySelector(
          `#pdfHeader${this.toHtmlIdSafeString(this.downloadables.pdf?.title)}`
      );
      const footerElement = document.querySelector(
          `#pdfFooter${this.toHtmlIdSafeString(this.downloadables.pdf?.title)}`
      );

      QuickListsHelpers.downloadPdf(
          this.downloadables.pdf?.title,
          bodyElement,
          this.downloadables.pdf['margin'] ? this.downloadables.pdf['margin'] : 0,
          footerElement,
          headerElement
      )

    },








    toHtmlIdSafeString(str) {
      return str
          .toString()                  // Ensure it's a string
          .toLowerCase()               // Convert to lowercase
          .trim()                      // Remove whitespace from both ends
          .replace(/\s+/g, '-')        // Replace spaces with hyphens
          .replace(/[^a-z0-9_-]/g, '') // Remove invalid characters
          .replace(/^-+/, '');         // Remove leading hyphens (if any)
    },
    convertToCsv() {
      // Check if data is not empty
      if (this.itemsForExport.length === 0) {
        return '';
      }

      // Generate header from the keys of the first object in the data array
      const header = Object.keys(this.itemsForExport[0]).join(',');

      // Generate rows from the data
      const rows = this.itemsForExport.map(row => {
        return Object.values(row).map(value => `"${value}"`).join(',');
      });

      return [header, ...rows].join('\r\n');
    },
    truncateStr(str) {
      let truncatedStr = "";
      if (str) {
        const maxLength = 40;
        truncatedStr = str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
      }
      return truncatedStr;
    },
    shouldWeShowTopBar() {
      // let result = true
      let result = false
      if (
          this.viewAs.show.length ||
          (
              this.filterInputs.length &&
              (
                  this.allowedFilters == null ||
                  this.filterInputs.some(
                      filterInput =>  this.allowedFilters.includes(filterInput.name)
                  )
              )
          ) ||
          this.model.titleKey !== this.model.primaryKey ||
          Object.keys(this.downloadables).includes('csv') ||
          Object.keys(this.downloadables).includes('pdf')
      ){
        result = true
      }
      return result
    },
    doSearch(searchTerm) {
      this.filters[this.model.titleKey] = searchTerm
      this.fetchData();
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
      // everything from here down could be in helper methods
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
          // =------------------------------------
          per_page: this.options.itemsPerPage,
          page: this.options.page,
        };
      }
      const response = await this.model.FetchAll(
          // =========================
          this.relationships,
          {
            ...rules,
            ...flagsComputed,
            /// -----------------------
            ...this.fetchFlags,
          },
          extraHeaderComputed,
          {
            page: this.options.page,
            limit: this.options.itemsPerPage,
            //============================
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
      this.$emit('fetchComplete', this.model.name, this.items);
    },
    activateAndFetchData() {
      if (!this.activated && !this.disabled) {
        this.activated = true;
        this.fetchData();
      }
    },
  },
  watch: {
    forcedFilters: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) { // Compare serialized objects
          this.activated = false;
          this.items = []
        }
      },
      deep: true, // Deep watch to detect changes in nested properties
    },
    items(newVal) {
      if (newVal.length){
        this.$emit('update:items', newVal)
      }
    },
    search(value) {
      if (!this.disabled) {
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.doSearch(value)
        }, 300)
      }
    },
    filters: {
      handler() {
        if (!this.loading && !this.justCreateButton) {
          this.fetchData();
        }
      },
      deep: true,
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
      // if (!this.loading && !this.justCreateButton) {
      if (!this.justCreateButton) {
        this.fetchData();
      }
    }
  }
};
</script>

<style lang="scss">
//.highlighted {
//  background-color: #f0f0f0;
//}


</style>
