<template>
  <div>
    <template v-if="filteredChildRelations.length">

      <!--      <pre>{{headers}}</pre>-->
      <q-tabs
          v-model="activeTab"
          align="left"
      >
        <q-tab :name="'tab'"> Overview </q-tab>
        <q-tab
            v-for="(relation, index) in filteredChildRelations"
            :key="index"
            :name="'tab-' + index"
        >
          {{ relation.field.label }}
        </q-tab>
      </q-tabs>
      <q-tab-panels v-model="activeTab">
        <q-tab-panel name="tab">
          <template v-if="!loading">
            <RecordOverviewWrapper
                :item="item"
                :superOptions="superOptions"
                :templateOverview="templateOverview"
                :filteredChildRelations="filteredChildRelations"
                :childRelations="childRelations"
            >
              <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps"></slot>
              </template>
            </RecordOverviewWrapper>
          </template>
          <template v-else>
            Loading...
          </template>
        </q-tab-panel>
        <q-tab-panel
            v-for="(relation, index) in filteredChildRelations"
            :key="index"
            :name="'tab-' + index"
        >
          <SuperTable
              :ref="`tab-${index}`"
              :currentParentRel="relation"
              :model="relation.field.meta.field.related"
              :canEdit="canEdit"
              :user="user"
              :forcedFilters="filters(relation.currentParentRecord.foreignKeyToParentRecord)"
              @clickRow="(e) => {relation.field.meta.field.related.openRecord(e)}"
          >
            <template v-if="$slots[relation.field.name]" v-slot:create>
              <slot :name="relation.field.name" />
            </template>
          </SuperTable>
        </q-tab-panel>
      </q-tab-panels>
    </template>
    <template v-else>
      <RecordOverviewWrapper
        :item="item"
        :superOptions="superOptions"
        :templateOverview="templateOverview"
        :filteredChildRelations="filteredChildRelations"
        :childRelations="childRelations"
      >
        <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
          <slot :name="slotName" v-bind="slotProps"></slot>
        </template>
      </RecordOverviewWrapper>
    </template>
  </div>
</template>

<script>
import SuperTable from "./SuperTable.vue";
import RecordOverview from "./RecordOverview.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import RecordOverviewDynamic from "./RecordOverviewDynamic.vue";
import SuperTableTable from "./SuperTableTable.vue";
import RecordOverviewWrapper from "./RecordOverviewWrapper.vue";

export default {
  name: "SuperRecord",
  components: {
    RecordOverviewWrapper,
    SuperTableTable,
    RecordOverviewDynamic,
    RecordOverview,
    SuperTable,
  },
  props: {
    hideRelations: {
      type: Boolean,
      default() {
        return false;
      },
    },
    templateOverview: {
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
    user: {
      type: Object,
      default: () => ({}),
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
      activeTab: 'tab',
      loading: true,
      initialLoadHappened: false,
      item: {},
    };
  },
  computed: {
    superOptions() {
      return {
        headers: this.headers,
        modelFields: this.modelFields,
        displayMapField: this.displayMapField,
        model: this.model,
        canEdit: this.canEdit,
        currentParentRel: {},
        user: this.user,
      };
    },
    rowsAndDataIndicators() {
      let result = {
        dataIndicators: [],
        rows: [],
      };
      if (this.templateOverview && this.templateOverview.rows) {
        result.rows = this.templateOverview.rows;
      }

      for (const rowKey in result.rows) {
        for (const col of result.rows[rowKey].cols) {
          if (col.rows) {
            for (const row of col.rows) {
              for (const col2 of row.cols) {
                if (col2.dataPoint.field) {
                  result.dataIndicators.push(col2.dataPoint.field);
                }
              }
            }
          } else {
            if (col.dataPoint.field) {
              result.dataIndicators.push(col.dataPoint.field);
            }
          }
        }
      }

      return result;
    },
    canEdit() {
      return true;
    },
    childRelations() {
      const fields = QuickListsHelpers.computedAttrs(this.model, this.excludedCols);
      const result = [];

      for (let fieldName in fields) {
        const field = fields[fieldName];
        if (field.usageType.startsWith("relChildren")) {
          result.push({
            field,
            currentParentRecord: {
              item: this.item,
              model: this.model,
              relationType: field.usageType,
              foreignKeyToParentRecord: field.meta.field.foreignKey,
            },
          });
        }
      }
      return result;
    },
    filteredChildRelations() {
      let result = [];
      if (!this.hideRelations){
        for (const childRelation of this.childRelations) {
          if (!this.rowsAndDataIndicators.dataIndicators.includes(childRelation.field.name)) {
            result.push(childRelation);
          }
        }
      }
      return result;
    },
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(this.model, [], this.canEdit, this.displayMapField);
    },
    // item() {
    //   return this.model.query().whereId(this.id).withAll().get()[0];
    // },
    modelFields() {
      return QuickListsHelpers.computedAttrs(this.model, this.excludedCols);
    },
  },
  methods: {
    getMsg(type) {
      if (Array.isArray(type)) {
        return type.length > 1
            ? `To create first set your active ${type[0]} group and active ${type[1]} group`
            : "";
      } else {
        return `To create first set your active ${type} group`;
      }
    },
    filters(foreignKey) {
      return {
        [foreignKey]: this.id,
      };
    },
    fetchData() {
      this.loading = true
      this.model
          .FetchById(
              this.id,
              this.relationships,
              { flags: {}, moreHeaders: {}, rels: [] }
          )
          .then((response) => {

            this.item = response.response.data.data
            this.loading = false
            this.initialLoadHappened = true;
            this.$emit("initialLoadHappened", true);
          })
          .catch(() => {
            this.loading = false
            this.initialLoadHappened = true;
            this.$emit("initialLoadHappened", true);
          });
    },
  },
  mounted() {
    this.fetchData();
  },
  watch: {
    activeTab(newVal) {
      this.$nextTick(() => {
        if (this.$refs[newVal]) {
          this.$refs[newVal][0].fetchData();
        }
      });
    },
  },
};
</script>

<style scoped></style>
