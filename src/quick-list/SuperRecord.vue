<template>
  <div>
    <!--      <pre>{{headers}}</pre>-->
    <q-tabs v-model="activeTab">
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
        <template v-if="model.displayMapFull && model.displayMapFull.rows">
          <RecordOverviewDynamic
              :item="item"
              :childRelations="childRelations"
              :filteredChildRelations="filteredChildRelations"
              :superOptions="{
              headers: headers,
              modelFields: modelFields,
              displayMapField: displayMapField,
              model: model,
              canEdit: canEdit,
              currentParentRel: {},
              user: user,
            }"
          >
            <template v-for="(slot, slotName) in $slots" v-slot:[slotName]="slotProps">
              <slot :name="slotName" v-bind="slotProps"></slot>
            </template>
          </RecordOverviewDynamic>
        </template>
        <template v-else>
          <RecordOverview
              :item="item"
              :superOptions="{
              headers: headers,
              modelFields: modelFields,
              displayMapField: displayMapField,
              model: model,
              canEdit: canEdit,
              currentParentRel: {},
              user: user,
            }"
          />
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
        >
          <template v-if="$slots[relation.field.name]" v-slot:create>
            <slot :name="relation.field.name" />
          </template>
        </SuperTable>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script>
import SuperTable from "./SuperTable.vue";
import RecordOverview from "./RecordOverview.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import RecordOverviewDynamic from "./RecordOverviewDynamic.vue";

export default {
  name: "SuperRecord",
  components: {
    RecordOverviewDynamic,
    RecordOverview,
    SuperTable,
  },
  props: {
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
  },
  data() {
    return {
      activeTab: null,
    };
  },
  computed: {
    rowsAndDataIndicators() {
      let result = {
        dataIndicators: [],
        rows: [],
      };
      if (this.model.displayMapFull && this.model.displayMapFull.rows) {
        result.rows = this.model.displayMapFull.rows;
      }

      for (const rowKey in result.rows) {
        for (const col of result.rows[rowKey].cols) {
          if (col.rows) {
            for (const row of col.rows) {
              for (const col2 of row.cols) {
                if (col2.dataPoint.data) {
                  result.dataIndicators.push(col2.dataPoint.data);
                }
              }
            }
          } else {
            if (col.dataPoint.data) {
              result.dataIndicators.push(col.dataPoint.data);
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
      for (const childRelation of this.childRelations) {
        if (!this.rowsAndDataIndicators.dataIndicators.includes(childRelation.field.name)) {
          result.push(childRelation);
        }
      }
      return result;
    },
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(this.model, [], this.canEdit, this.displayMapField);
    },
    item() {
      return this.model.query().whereId(this.id).withAll().get()[0];
    },
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
      this.model
          .FetchById(this.id, [], { flags: {}, moreHeaders: {}, rels: [] })
          .then(() => {})
          .catch(() => {});
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
