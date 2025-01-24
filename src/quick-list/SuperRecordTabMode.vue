<template>
  <div>
    <div>
      <!--      <pre>{{headers}}</pre>-->
      <q-tabs
          v-model="activeTab"
          align="left"
          v-if="this.allowedTabs.length !== 1"
      >
        <q-tab
            :name="'tab-overview'"
            v-if="this.allowedTabs.length === 0 || this.allowedTabs.includes('overview')"
            data-name="overview"
        >
          Overview
        </q-tab>
        <q-tab
            :name="'tab-map'"
            v-if="someChildrenCanBeMapped && (this.allowedTabs.length === 0 || this.allowedTabs.includes('map'))"
            data-name="map"
        >
          Map
        </q-tab>
        <q-tab
            :name="'tab-calendar'"
            v-if="someChildrenCanBeCalendared && (this.allowedTabs.length === 0 || this.allowedTabs.includes('calendar'))"
            data-name="calendar"
        >
          Calendar
        </q-tab>
        <q-tab
            v-for="(relation, index) in filteredChildRelations"
            :key="index"
            :name="'tab-' + index"
            :data-name="relation.field.name"
        >
          {{ relation.field.label }}
        </q-tab>
      </q-tabs>
      <q-tab-panels v-model="activeTab" :class="this.allowedTabs.length == 1 ? 'SuperRecorSingleTabOnly' : ''">
        <q-tab-panel
            name="tab-overview"
            v-if="this.allowedTabs.length === 0 || this.allowedTabs.includes('overview')"
        >
          <template v-if="!loading">
            <OverviewTab
                :item="item"
                :superOptions="superOptions"
                :templateOverview="templateOverview"
                :filteredChildRelations="filteredChildRelations"
                @editItem="editItem"
                @deleteItem="deleteItem"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </OverviewTab>
          </template>
          <template v-else>
            <div class="text-center q-pa-md">Loading...</div>
          </template>
        </q-tab-panel>

        <q-tab-panel
            :name="'tab-calendar'"
            v-if="someChildrenCanBeCalendared && (this.allowedTabs.length === 0 || this.allowedTabs.includes('calendar'))"
        >
          <CalendarPolyContentWrapper
              :configsCollection="configsCollection"
              :childRelations="childRelations"
              :parentPrimaryKey="this.id"
          />
        </q-tab-panel>
        <q-tab-panel
            :name="'tab-map'"
            v-if="someChildrenCanBeMapped && (this.allowedTabs.length === 0 || this.allowedTabs.includes('map'))"
        >
          ...
        </q-tab-panel>
        <q-tab-panel
            v-for="(relation, index) in filteredChildRelations"
            :key="index"
            :name="'tab-' + index"
        >
          <SuperTable
              :ref="`tab-${index}`"
              :parentKeyValuePair="parentKeyValuePair(relation)"
              :model="relation.field.meta.field.related"
              :canEdit="canEdit"
              :filterVals="filters(relation)"
              @clickRow="(pVal, item) => {clickRow(pVal, item, relation)}"
          >
            <template v-if="$slots[relation.field.name]" v-slot:create>
              <slot :name="relation.field.name" />
            </template>
          </SuperTable>
        </q-tab-panel>
      </q-tab-panels>
    </div>


  </div>
</template>

<script>
import SuperTable from "./SuperTable.vue";
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import RecordFieldsForDisplayCustom from "./RecordFieldsForDisplayCustom.vue";
import SuperTableTable from "./SuperTableTable.vue";
import OverviewTab from "./OverviewTab.vue";
import {defineAsyncComponent} from "vue";
import {Helpers} from "../index";
import CalendarPolyContentWrapper from "./CalendarPolyContentWrapper.vue";
const AsyncCreateEditFormComponent = defineAsyncComponent(() =>
    import('./CreateEditForm.vue')
);

export default {
  name: "SuperRecordTabMode",
  components: {
    CalendarPolyContentWrapper,
    CreateEditForm: AsyncCreateEditFormComponent,
    OverviewTab,
    SuperTableTable,
    RecordFieldsForDisplayCustom,
    RecordFieldsForDisplayGeneric,
    SuperTable,
  },
  props: {
    superOptions: {
      type: Object,
      default: {},
    },
    item: {
      type: Object,
      default: {},
    },
    loading: {
      type: Boolean,
      default: false,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
    configsCollection: {
      type: Object,
      default: {},
    },
    allowedTabs: {
      type: Array,
      default() {
        return [];
      },
    },
    templateOverview: {
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
    model: {
      type: [Object, Function],
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    displayMapField: {
      type: Boolean,
      default: false,
    },
    relationships: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      activeTab: 'tab-overview',
    };
  },
  computed: {
    someChildrenCanBeCalendared() {
      return this.childRelations.some(
          child =>  child.canBeCalendared
      )
    },
    someChildrenCanBeMapped() {
      return this.childRelations.some(
          child =>  child.canBeMapped
      )
    },
    fieldsUsedInOverview() {
      // let result = {
      //   dataIndicators: [],
      //   cols: [],
      // };
      const result = []
      if (this.templateOverview && this.templateOverview.cols) {
        for (const col of this.templateOverview.cols) {
          if (col.cols) {
            for (const col2 of col.cols) {
              if (col2.dataPoint.field) {
                result.push(col2.dataPoint.field);
              }
            }
          } else {
            if (col.dataPoint.field) {
              result.push(col.dataPoint.field);
            }
          }
        }
      }

      return result;
    },
    childRelations() {
      const fields = QuickListsHelpers.computedAttrs(this.model, []);
      const result = [];

      for (let fieldName in fields) {
        const field = fields[fieldName];
        if (field.usageType.startsWith("relChildren")) {
          const child = {
            field,

            // currentParentRecord: {
            //   item: this.item,
            //   model: this.model,
            //   relationType: field.usageType,
            //   foreignKeyToParentRecord: field.meta.field.foreignKey,
            // },
          }

          const headers = QuickListsHelpers.SupaerTableHeaders(
              field.meta.field.related,
              [this.parentKeyValuePair({field}).parentFKey],
          )

          const startfield = Helpers.getFieldFromModelOrParent(headers, 'timeRangeStart');

          if (startfield){
            child.canBeCalendared = true
          } else {
            child.canBeCalendared = false
          }

          let longField = Helpers.getFieldFromModelOrParent(headers, 'mapExtraGeoLocLong');

          if (longField){
            child.canBeMapped = true
          } else {
            child.canBeMapped = false
          }

          child.superOptions = {
            headers,
            modelFields: QuickListsHelpers.computedAttrs(
                field.meta.field.related,
                [this.parentKeyValuePair({field}).parentFKey],
            ),
            displayMapField: false,
            model: field.meta.field.related,
            canEdit: field.meta.field.related.rules.creatable()
          }
          // console.log('field')
          // console.log(child.superOptions)

          result.push(child);
        }
      }

      return result;
    },
    filteredChildRelations() {
      let result = [];
      if (!this.allowedTabs){
      }
      for (const childRelation of this.childRelations) {
        if (
            !this.fieldsUsedInOverview.includes(childRelation.field.name)
            && (this.allowedTabs.length === 0 || this.allowedTabs.includes(childRelation.field.name))
        ) {
          result.push(childRelation);
        }
      }
      return result;
    },
    // item() {
    //   return this.model.query().whereId(this.id).withAll().get()[0];
    // },
  },
  methods: {
    deleteItem(e) {
      this.$emit('deleteItem', e);
    },
    editItem(e) {
      this.$emit('editItem', e);
    },
    clickRow(pVal, item, relation) {
      relation.field.meta.field.related.openRecord(pVal, item, this.$router)
    },
    parentKeyValuePair(relation) {
      const fKey = relation.field.meta.field.foreignKey

      const result = {
        parentFKey: fKey,
        parentFVal: this.item[this.model.primaryKey],
        parentItem: this.item,
      }
      return result
    },
    getMsg(type) {
      if (Array.isArray(type)) {
        return type.length > 1
            ? `To create first set your active ${type[0]} group and active ${type[1]} group`
            : "";
      } else {
        return `To create first set your active ${type} group`;
      }
    },
    filters(relation) {
      const parentKeyValuePair = this.parentKeyValuePair(relation)

      return {
        [parentKeyValuePair.parentFKey]: parentKeyValuePair.parentFVal,
      };
    },
  },
  mounted() {
    if(this.allowedTabs.length){
      this.activeTab = `tab-${this.allowedTabs[0]}`
    }
  },
  watch: {
    activeTab(newVal) {
      this.$nextTick(() => {
        if (this.$refs[newVal]) {
          this.$refs[newVal][0].fetchData();
        }
      });
    },
    item(newVal) {
      if (Object.keys(newVal).length !== 0){
        this.$emit('update:item', newVal)
      }
    },
  }
};
</script>

<style lang="scss">
.SuperRecorSingleTabOnly {
  .q-tab-panel {
    padding: 0;
  }
}
</style>
