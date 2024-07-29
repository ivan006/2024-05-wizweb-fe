<template>
  <div>
    <template v-if="dataPoint.xOrientation">
      <div class="">
        <div class="row">
          <template v-if="!dataPoint.hideLabel">
            <div class="q-pr-sm">
              <div class="" style="font-weight: bold;">
                {{ label }}:
              </div>
            </div>
          </template>
          <div>
            <component :is="dataPoint.tag ? dataPoint.tag : 'div'" :class="dataPoint.class ? dataPoint.class : ''">
              <template v-if="isRelChildren(compHeader)">
                <div class="q-pt-sm">
                  <template v-if="compRelation">
                    <SuperTable
                        :currentParentRel="compRelation"
                        :model="compRelation.field.meta.field.related"
                        :canEdit="superOptions.canEdit"
                        :defaultViewModeProp="dataPoint.relationViewMode ? dataPoint.relationViewMode : 'table'"
                    >
                      <template v-if="!!$slots[compRelation.field.name]" #create>
                        <slot :name="compRelation.field.name" />
                      </template>
                    </SuperTable>
                  </template>
                </div>
              </template>
              <template v-else-if="dataPoint.type === 'component'">
                <component :is="asyncComponent" :item="item" />
              </template>
              <template v-else-if="dataPoint.type === 'function'">
                {{ dataPoint.function(item) }}
              </template>
              <template v-else>
                <FormattedColumn :header="compHeader" :item="item" :superOptions="superOptions" hideLabel />
              </template>
            </component>
          </div>
        </div>
      </div>
    </template>
    <template v-else>

      <template v-if="!dataPoint.hideLabel && !hideLabel">
        <div class="" style="font-weight: bold;">
          {{ label }}:
        </div>
      </template>
      <component :is="dataPoint.tag ? dataPoint.tag : 'div'" :class="dataPoint.class ? dataPoint.class : ''">
        <template v-if="isRelChildren(compHeader)">
          <div class="q-pt-sm">
            <template v-if="compRelation">
              <SuperTable
                  :currentParentRel="compRelation"
                  :model="compRelation.field.meta.field.related"
                  :canEdit="superOptions.canEdit"
                  :defaultViewModeProp="dataPoint.relationViewMode ? dataPoint.relationViewMode : 'table'"
              >
                <template v-if="!!$slots[compRelation.field.name]" #create>
                  <slot :name="compRelation.field.name" />
                </template>
              </SuperTable>
            </template>
          </div>
        </template>
        <template v-else-if="dataPoint.type === 'component'">
          <component :is="asyncComponent" :item="item" />
        </template>
        <template v-else-if="dataPoint.type === 'function'">
          {{ dataPoint.function(item) }}
        </template>
        <template v-else>
          <FormattedColumn :header="compHeader" :item="item" :superOptions="superOptions" hideLabel />
        </template>
      </component>
    </template>
  </div>
</template>

<script>
import FormattedColumn from './FormattedColumn.vue'
import { defineAsyncComponent } from 'vue';
import RecordOverview from "./RecordOverview.vue";

export default {
  name: 'RecordOverviewDynamicDataPoint',
  components: {
    RecordOverview,
    SuperTable: defineAsyncComponent(() => import('./SuperTable.vue')),
    FormattedColumn,
  },
  props: {
    header: {
      type: Object,
      default() {
        return null;
      },
    },
    hideLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    dataPoint: {
      type: Object,
      default() {
        return {}
      },
    },
    item: {
      type: Object,
      default() {
        return {}
      },
    },
    childRelations: {
      type: Array,
      default() {
        return []
      },
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
          user: {},
        };
      },
    },
  },
  computed: {
    asyncComponent() {
      if (this.dataPoint.type === 'component' && this.dataPoint.componentPath) {
        return defineAsyncComponent(this.dataPoint.componentPath);
      }
      return null;
    },
    compHeader() {
      if (this.header){
        return this.header;
      } else if (this.dataPoint.type === 'component' || this.dataPoint.type === 'function') {
        return { label: this.dataPoint.customLabel };
      } else {
        const result = this.superOptions.headers.find((header) => {
          return header.field == this.dataPoint.field
        })
        return result
      }
    },
    compRelation() {
      let result = {}
      if (this.compHeader && this.isRelChildren(this.compHeader)) {
        result = this.childRelations.find((relation) => {
          return relation.field.name == this.dataPoint.field
        })
      }
      return result
    },
    label() {
      if (this.dataPoint.type === 'component' || this.dataPoint.type === 'function') {
        return this.dataPoint.customLabel;
      }
      return this.compHeader ? this.compHeader.label : '';
    }
  },
  methods: {
    deleteItem(e) {
      this.$emit('deleteItem', e)
    },
    editItem(e) {
      this.$emit('editItem', e)
    },
    isRelChildren(header) {
      return header?.usageType && header?.usageType.startsWith('relChildren');
    }
  },
}
</script>

<style scoped></style>
