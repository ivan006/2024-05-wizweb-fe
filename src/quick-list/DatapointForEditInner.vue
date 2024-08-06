<template>
  <div>
    <template v-if="field.dataType === 'uid'"></template>
    <template v-else-if="field.usageType.startsWith('rel')">
      <template v-if="field.usageType.startsWith('relLookup')"></template>
      <template v-else-if="field.usageType.startsWith('relForeignKeyNormal')">
        <!--<SuperSelect-->
        <!--    :modelField="field"-->
        <!--    :modelValue="modelValue"-->
        <!--    :model="field.meta.field.parent"-->
        <!--    variant="filled"-->
        <!--    density="default"-->
        <!--    :user="superOptions.user"-->
        <!--    :rules="[() => true]"-->
        <!--/>-->

        <!--<RelationComponent-->
        <!--    :configs="field"-->
        <!--    :modelValue="modelValue"-->
        <!--    readonly-->
        <!--    :rules="[() => true]"-->
        <!--/>-->

        <SuperTable
            :hideLabel="hideLabel"
            :isForSelectingRelation="true"
            :canEdit="false"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            :model="field.meta.field.parent"
            :rules="[() => true]"
            :modelField="field"
            :fetchFlags="{
              sort: field.meta.field.parent.titleKey
            }"
        />
      </template>
      <template v-else-if="field.usageType.startsWith('relForeignKeyMapExtraRel')">
        <RelationComponent
            :hideLabel="hideLabel"
            :configs="field"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            readonly
        />
      </template>
      <template v-else-if="field.usageType == 'relForeignKeyOwnerAppliedToProviderType'">
        <SuperSelect
            :hideLabel="hideLabel"
            :modelField="field"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            :model="field.meta.field.parent"
            readonly
            variant="filled"
            density="default"
        />
        <!--:user="superOptions.user"-->
      </template>
      <template v-else-if="field.usageType !== 'relChildrenNormal'">
        <RelationComponent
            :hideLabel="hideLabel"
            :configs="field"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
        />
      </template>
    </template>
    <template v-else-if="field.usageType == 'timeRangeType'">
      <DateAndTimeRangePicker
          :label="compLabel"
            :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
      />
    </template>
    <template v-else-if="field.usageType == 'timeRangeStart'">
      <DateAndTimePicker
          :label="compLabel"
            :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateStartTime"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
      />
    </template>
    <template v-else-if="field.usageType == 'timeRangeEnd'">
      <DateAndTimePicker
          :label="compLabel"
            :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
      />
    </template>
    <template v-else-if="field.usageType == 'timestampType'">
      <DateAndTimePicker
          :label="compLabel"
            :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
      />
    </template>
    <template v-else-if="field.usageType == 'dateType'">
      <q-input
          :label="compLabel"
          :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
          type="date"
          filled
          dense
      />
    </template>
    <template v-else-if="field.usageType.startsWith('staticLookup') && field.fieldExtras.usageTypeExtras?.options">
      <q-select
          :label="compLabel"
          :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          option-label="label"
          option-value="value"
          emitValue
          mapOptions
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
          :options="field.fieldExtras.usageTypeExtras.options"
          filled
          dense
      />

    </template>
    <template v-else-if="field.usageType == 'readOnlyTimestampType'">
      <DateAndTimePicker
          :label="compLabel"
            :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
          disabled
      />
    </template>
    <template v-else-if="field.usageType === 'mapName'">
      <SearchGooglePlace
          :hideLabel="hideLabel"
          :configs="field"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          @change="searchGooglePlace"
      />
    </template>
    <template v-else-if="field.usageType.startsWith('mapExtra')">
      <q-input
          :label="compLabel"
            :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
          readonly
          style="display: none"
          filled
          dense
      />
    </template>
    <template v-else-if="field.usageType == 'normal'">
      <template v-if="field.dataType === 'string'">
        <q-input
            :label="compLabel"
            :placeholder="compPlaceholder"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            :rules="field.meta.rules"
            :error="false"
            :error-message="''"
            filled
            dense
        />
      </template>
      <template v-else-if="field.dataType === 'boolean'">
        <q-checkbox
            :label="compLabel"
            :placeholder="compPlaceholder"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            :rules="field.meta.rules"
            :error="false"
            :error-message="''"
        />
      </template>
      <template v-else-if="field.dataType === 'number'">
        <q-input
            :label="compLabel"
            :placeholder="compPlaceholder"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            :rules="field.meta.rules"
            :error="false"
            :error-message="''"
            type="number"
            filled
            dense
        />
      </template>
      <template v-else-if="field.dataType === 'attr'">

        <q-input
            :label="compLabel"
            :placeholder="compPlaceholder"
            :modelValue="modelValue"
            @update:modelValue="updateModelValue"
            :rules="field.meta.rules"
            :error="false"
            :error-message="''"
            filled
            dense
        />
      </template>
    </template>
    <template v-else>
      <q-input
          :label="compLabel"
            :placeholder="compPlaceholder"
          :modelValue="modelValue"
          @update:modelValue="updateModelValue"
          :rules="field.meta.rules"
          :error="false"
          :error-message="''"
          filled
          dense
      />
    </template>
  </div>
</template>

<script>
import RelationComponent from "./RelationComponent.vue";
import DateAndTimeRangePicker from "./DateAndTimeRangePicker.vue";
import DateAndTimePicker from "./DateAndTimePicker.vue";
import moment from "moment";
import SearchGooglePlace from "./SearchGooglePlace.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import SuperSelect from "./SuperSelect.vue";
// import SuperTable from "./SuperTable.vue";
import { defineAsyncComponent } from 'vue'

const AsyncSuperTableComponent = defineAsyncComponent(() =>
    import('./SuperTable.vue')
);

export default {
  name: "DatapointForEditInner",
  components: {
    SuperSelect,
    SearchGooglePlace,
    DateAndTimePicker,
    DateAndTimeRangePicker,
    RelationComponent,
    // SuperTable,
    // SuperTable: () => import("./SuperTable.vue"),
    SuperTable: AsyncSuperTableComponent
  },
  props: {
    hideLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modelValue: {
      type: [Object,String,Number,Boolean],
      default() {
        return null
      },
    },
    field: {
      type: Object,
      default() {
        return {};
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
        };
      },
    },
  },
  data() {
    return {
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
    compLabel() {
      // if (this.hideLabel){
      //   return void 0
      // } else {
      //   return this.field.label
      // }

      return void 0
    },
    compPlaceholder() {
      // if (this.hideLabel){
      //   return this.field.label
      // } else {
      //   return void 0
      // }
      return this.field.label
    },
  },
  methods: {
    updateModelValue(item){
      this.$emit('update:modelValue', item)
    },
    updateStartTime(arg) {
      // this.$emit('update:modelValue', arg);
      this.$emit('updateSetDefaultEndTime', arg);
    },
    async searchGooglePlace(arg) {
      // Implement the necessary logic
    },
  },
  mounted() {
    // const creatorKey = this.superOptions.modelFields.find((field) => field.usageType == "relForeignKeyCreatorType");
    // if (creatorKey) {
    //   this.itemData[creatorKey.name] = this.superOptions.user.id; // Assuming user has an id property
    // }
  },
};
</script>

<style scoped></style>
