<template>
  <div>
    <template v-if="shouldWeShowTopBar()">
      <div :class="noBorder ? 'q-mx-md' : ''">
        <DestructableExpansionPanels
            :destroy="!quickListsIsMobile"
            title="Settings"
        >
          <div class="row items-center wrap">
            <div
                v-if="
                canCreateComputed &&
                canEdit &&
                !hideCreate &&
                !isForSelectingRelation
              "
                style="margin-bottom: 20px"
                class="q-mr-sm"
            >
              <template v-if="!!$slots.create">
                <slot name="create" />
              </template>
              <template v-else>
                <CreateButton
                    v-if="superOptions.model.rules.creatable()"
                    :modelFields="superOptions.modelFields"
                    @createItem="createItem"
                    :model="superOptions.model"
                    :superOptions="superOptions"
                    :template="templateForm"
                    :createButtonText="createButtonText"
                />
              </template>
            </div>
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
                    :modelValue="activeTab"
                    @update:modelValue="(newVal) => {$emit('update:activeTab', newVal)}"
                    toggle-color="primary"
                    :options="tabOptions"
                    style="margin-bottom: 20px"
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
              <!--<pre>{{modelValueRef[filterInput.name]}}</pre>-->
              <!--<pre>{{allowedFilters}}</pre>-->
              <!--{{filterInput.name}} {{ modelValue[filterInput.name] !== 'undefined'}}-->
              <template
                  v-if="
                  typeof modelValueRef[filterInput.name] !== 'undefined' &&
                  (allowedFilters == null ||
                    allowedFilters.includes(filterInput.name))
                "
              >
                <template
                    v-if="filterInput.usageType.startsWith('relForeignKey')"
                >
                  <div style="min-width: 200px">
                    <SuperTable
                        :isForSelectingRelation="true"
                        :canEdit="false"
                        v-model="modelValueRef[filterInput.name]"
                        v-model:titleVal="filterNamesRef[filterInput.name]"
                        :model="filterInput.meta.field.parent"
                        :rules="[() => true]"
                        :modelField="filterInput"
                        class="q-mr-sm"
                    />
                    <!--v-model="modelValueRef[filterInput.name].value"-->
                  </div>
                </template>
                <template v-if="filterInput.usageType == 'timeRangeStart'">
                  <FilterTime
                      :key="filterInput.name"
                      :modelField="filterInput"
                      v-model="modelValueRef[filterInput.name]"
                      class="q-mr-sm col-grow"
                      style="max-width: 200px"
                  />
                  <!--v-model="modelValueRef[filterInput.name].value"-->
                </template>
              </template>
              <template v-else>
                <template v-if="filterInput.usageType == 'mapFilter'">
                  <FilterPlace
                      v-if="Object.keys(this.filterNames).length !== 0"
                      :key="filterInput.name"
                      :filterField="filterInput"
                      v-model="modelValueRef"
                      v-model:filterNames="filterNamesRef"
                      class="q-mr-sm col-grow"
                      style="max-width: 200px"
                  />
                </template>
              </template>
            </template>
            <q-input
                v-if="
                this.superOptions.model.titleKey !==
                this.superOptions.model.primaryKey
              "
                v-model="searchRef"
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
                  :style="{
                  backgroundColor: 'var(--q-color-grey-2)',
                  'margin-left': 'auto',
                }"
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
              <div style="display: none">
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
  </div>
</template>

<script>
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import {defineAsyncComponent} from "vue";
import QuickListsHelpers from "./QuickListsHelpers";
import FilterPlace from "./FilterPlace.vue";
import FilterTime from "./FilterTime.vue";
import DestructableExpansionPanels from "./DestructableExpansionPanels.vue";
import CreateButton from "./CreateButton.vue";
import PdfTemplate from "./PdfTemplate.vue";

const AsyncComponentSuperTable = defineAsyncComponent(
    () => import("./SuperTable.vue"),
);

export default {
  name: "SuperTableTopBar",
  components: {
    PdfTemplate,
    CreateButton,
    DestructableExpansionPanels,
    FilterTime,
    SuperTable: AsyncComponentSuperTable,
    FilterPlace,
  },
  props: {
    filterNames: {
      type: Object,
      default() {
        return {};
      },
    },
    templateForm: {
      type: Object,
      default() {
        return {};
      },
    },
    createButtonText: {
      type: String,
      default: "",
    },
    allowedFilters: {
      type: Array,
      default: null,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: Object,
      default: {},
    },
    downloadables: {
      type: Object,
      default: {},
    },
    templateListTable: {
      type: Object,
      default: {},
    },
    canCreateComputed: {
      type: Boolean,
      default: false,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    isForSelectingRelation: {
      type: Boolean,
      default: false,
    },
    hideCreate: {
      type: Boolean,
      default: false,
    },
    startFieldName: {
      type: String,
      default: "",
    },
    activeTab: {
      type: String,
      default: "",
    },
    search: {
      type: String,
      default: "",
    },
    longField: {
      type: Object,
      default: {},
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
    viewAs: {
      type: Object,
      default() {
        return {
          show: ["table", "grid", "map", "calendar"],
          default: "table",
        };
      },
    },
  },
  data() {
    return {
      searchRef: "",
      modelValueRef: {},
      filterNamesRef: {},
    };
  },
  computed: {
    flattenedHeaders() {
      let result = [];
      if (this.templateListTable.length) {
        for (const field of this.templateListTable) {
          const validField = this.superOptions.headers.find(
              (header) => header.field === field.field,
          );
          let addableField = {};

          if (typeof validField !== "undefined") {
            addableField = validField;

            if (typeof field.label !== "undefined") {
              addableField.label = field.label;
            }
            addableField.userConfig = field;
          } else {
            let label = "";
            if (typeof field.label !== "undefined" && !field.hideLabel) {
              label = field.label;
            }

            let fieldName = "";
            if (typeof field.field !== "undefined") {
              fieldName = field.field;
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
              userConfig: field,
            };
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
                userConfig: {},
              });
            }
          }
        }
      }

      return result;
    },
    quickListsIsMobile() {
      return QuickListsHelpers.quickListsIsMobile();
    },
    tabOptions() {
      let result = [];
      // let result = [
      //   { label: 'Table', value: 'table' },
      //   { label: 'Grid', value: 'grid' },
      //   { label: 'Map', value: 'map' },
      //   { label: 'Calendar', value: 'calendar' },
      // ]
      if (this.viewAs.show.includes("grid")) {
        result.push({label: "Grid", value: "grid", icon: "grid_view"});
      }
      if (this.viewAs.show.includes("map") && Object.keys(this.longField).length !== 0) {
        result.push({label: "Map", value: "map", icon: "map"});
      }
      if (this.viewAs.show.includes("calendar") && this.startFieldName) {
        result.push({
          label: "Calendar",
          value: "calendar",
          icon: "calendar_today",
        });
      }
      if (this.viewAs.show.includes("table")) {
        result.push({label: "Table", value: "table"});
      }
      return result;
    },
    itemsForExport() {
      const result = [];
      let compItem = {};
      for (const item of this.items) {
        compItem = {};
        for (const header of this.flattenedHeaders) {
          if (header.userConfig && header.userConfig.type === "function") {
            compItem[header.label] = header.userConfig.function(item);
          } else if (header.usageType) {
            if (
                header.usageType === "readOnlyTimestampType" ||
                header.usageType === "timestampType" ||
                header.usageType === "timeRangeStart" ||
                header.usageType === "timeRangeEnd"
            ) {
              compItem[header.label] = this.formatTimestamp(item[header.field]);
            } else if (header.usageType.startsWith("relLookup")) {
              if (item?.[header.field]?.[header.meta.lookupDisplayField]) {
                compItem[header.label] =
                    item?.[header.field]?.[header.meta.lookupDisplayField];
              }
            } else if (
                !header.usageType.startsWith("relChildren") &&
                item[header.field]
            ) {
              compItem[header.label] = this.truncateStr(item[header.field]);
            }
          }
        }
        result.push(compItem);
      }
      return result;
    },
    filterInputs() {
      const data = this.superOptions.modelFields;

      return QuickListsHelpers.filterInputs(data)
    },
  },
  methods: {
    toHtmlIdSafeString(str) {
      return str
          .toString() // Ensure it's a string
          .toLowerCase() // Convert to lowercase
          .trim() // Remove whitespace from both ends
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/[^a-z0-9_-]/g, "") // Remove invalid characters
          .replace(/^-+/, ""); // Remove leading hyphens (if any)
    },
    createItem(event) {
      this.$emit("createItem", event);
    },
    formatTimestamp(timestamp) {
      if (timestamp) {
        const timezone = "Africa/Johannesburg"; // replace with desired timezone
        return dayjs.utc(timestamp, "YYYY-MM-DDTHH:mm:ss.SSSSSSZ") // Parse in UTC
            .tz(timezone) // Convert to target timezone
            .format("dddd, MMMM D, YYYY h:mm A"); // Format in target timezone
      }
      return null;
    },
    convertToCsv() {
      // Check if data is not empty
      if (this.itemsForExport.length === 0) {
        return "";
      }

      // Generate header from the keys of the first object in the data array
      const header = Object.keys(this.itemsForExport[0]).join(",");

      // Generate rows from the data
      const rows = this.itemsForExport.map((row) => {
        return Object.values(row)
            .map((value) => `"${value}"`)
            .join(",");
      });

      return [header, ...rows].join("\r\n");
    },
    truncateStr(str) {
      let truncatedStr = "";
      if (str) {
        const maxLength = 40;
        truncatedStr =
            str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
      }
      return truncatedStr;
    },
    defineAsyncComponent,
    downloadCsv() {
      const csvData = this.convertToCsv();
      const blob = new Blob([csvData], {type: "text/csv;charset=utf-8;"});
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `${this.downloadables.csv?.title}.csv`);
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
          `#pdfBody${this.toHtmlIdSafeString(this.downloadables.pdf?.title)}`,
      );
      const headerElement = document.querySelector(
          `#pdfHeader${this.toHtmlIdSafeString(this.downloadables.pdf?.title)}`,
      );
      const footerElement = document.querySelector(
          `#pdfFooter${this.toHtmlIdSafeString(this.downloadables.pdf?.title)}`,
      );

      QuickListsHelpers.downloadPdf(
          this.downloadables.pdf?.title,
          bodyElement,
          this.downloadables.pdf["margin"] ? this.downloadables.pdf["margin"] : 0,
          footerElement,
          headerElement,
      );
    },

    shouldWeShowTopBar() {
      // let result = true
      let result = false;
      if (
          this.viewAs.show.length ||
          (this.filterInputs.length &&
              (this.allowedFilters == null ||
                  this.filterInputs.some((filterInput) =>
                      this.allowedFilters.includes(filterInput.name),
                  ))) ||
          this.superOptions.model.titleKey !==
          this.superOptions.model.primaryKey ||
          Object.keys(this.downloadables).includes("csv") ||
          Object.keys(this.downloadables).includes("pdf") ||
          (this.canCreateComputed &&
              this.canEdit &&
              !this.hideCreate &&
              !this.isForSelectingRelation)
      ) {
        result = true;
      }
      return result;
    },
  },
  watch: {
    modelValue: {
      handler(newVal, oldVal) {
        // Use stringified comparison for deep change detection
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.modelValueRef = {...newVal};
        }
      },
      deep: true,
    },
    modelValueRef: {
      handler(newVal, oldVal) {
        // Use stringified comparison to prevent unnecessary updates
        // if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.$emit("update:modelValue", this.modelValueRef);
        // }
      },
      deep: true,
    },

    filterNames: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.filterNamesRef = JSON.parse(JSON.stringify(newVal)); // Deep copy to avoid reference issues
        }
      },
      deep: true,
    },
    filterNamesRef: {
      handler(newVal, oldVal) {
        this.$emit("update:filterNames", newVal);
      },
      deep: true,
    },

    search: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.searchRef = newVal;
        }
      },
    },
    searchRef: {
      handler(newVal, oldVal) {
        if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
          this.$emit("update:search", newVal);
        }
      },
    },
  },
  mounted() {


    // QuickListsHelpers.bindDeepPropToRef(this, [
    //   { prop: "modelValue", refName: "modelValueRef" },
    //   { prop: "filterNames", refName: "filterNamesRef" },
    //   { prop: "search", refName: "searchRef" },
    // ]);
    this.modelValueRef = {...this.modelValue};

    if (Object.keys(this.filterNames).length !== 0) {

      this.filterNamesRef = {...this.filterNames};

    } else {

      for (const filterInput of this.superOptions.modelFields) {
        if (
            filterInput.usageType.startsWith('relForeignKey')
        ) {
          this.filterNamesRef[filterInput.name] = null
        }
      }

    }

    this.searchRef = this.search;
    for (const modelField of this.superOptions.modelFields) {
      if (
          modelField.usageType.startsWith("relForeignKey")
      ) {

        this.modelValueRef[modelField.name] = null;

      } else if (modelField.dataType.startsWith("mapExtraRel")) {

        this.modelValueRef[modelField.name] = null;

      } else if (modelField.usageType == "timeRangeStart") {

        this.modelValueRef[modelField.name] = null;

      }
    }
  },


};
</script>
