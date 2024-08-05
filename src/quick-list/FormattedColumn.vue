<template>
  <div :class="isHeading ? 'text-h6' : ''">


    <template v-if="typeof header.usageType == 'undefined'"></template>
    <template v-else-if="!isHeading && !hideLabel && !header.usageType.startsWith('relChildren')">
      <div class="text-caption">
        {{ header.label }}
      </div>
    </template>

    <template v-if="typeof header.usageType == 'undefined'">
      {{typeof header.usageType}}
    </template>
    <template v-else-if="header.usageType.startsWith('relChildren')"></template>
    <template
        v-else-if="
        header.usageType == 'readOnlyTimestampType' ||
        header.usageType == 'timestampType' ||
        header.usageType == 'timeRangeStart' ||
        header.usageType == 'timeRangeEnd'
      "
    >
      {{ formatTimestamp(item[header.field]) }}
    </template>
    <template v-else-if="header.usageType == 'actions'">
      <div @click.stop :style="disabled() ? 'cursor: default;' : ''">
        <q-btn
            @click.stop="editItem(item)"
            :disable="disabled()"
            color="grey"
            icon="edit"
            flat
            size="sm"
        />
        <q-btn
            @click.stop="deleteItem(item)"
            :disable="disabled()"
            color="grey"
            icon="delete"
            flat
            size="sm"
        />
      </div>


    </template>
    <template v-else-if="header.usageType.startsWith('relLookup')">
      <div
          style="min-height: 32px; cursor: pointer;"
          @click.stop="clickParent(item?.[header.field], header)"
      >
        <q-chip
            v-if="item?.[header.field]?.[header.meta.lookupDisplayField]"
        >
          {{ item?.[header.field]?.[header.meta.lookupDisplayField] }}
        </q-chip>
      </div>
    </template>
    <template v-else>
      <template v-if="isTag">
        <div
            @click.stop="clickParent(item)"
            style="cursor: pointer;"
        >
          <q-chip v-if="isTag">
            {{ item[header.field] }}
          </q-chip>
        </div>
      </template>
      <template v-else>
        <div :title="item[header.field]">
          {{ truncateStr(item[header.field]) }}
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import moment from 'moment';
import 'moment-timezone';
import QuickListsHelpers from './QuickListsHelpers';
import CreateEditForm from './CreateEditForm.vue';

export default {
  name: 'FormattedColumn',
  components: {
    CreateEditForm
  },
  props: {
    isTag: {
      type: Boolean,
      default() {
        return false;
      },
    },
    isHeading: {
      type: Boolean,
      default() {
        return false;
      },
    },
    hideLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    header: {
      type: Object,
      default() {
        return {};
      },
    },
    item: {
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
  methods: {
    clickParent(item, header) {
      const model = header.meta.field.parent;
      model.openRecord(item[model.primaryKey]);
    },
    truncateStr(str) {
      let truncatedStr = "";
      if (str) {
        const maxLength = 40;
        truncatedStr = str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
      }
      return truncatedStr;
    },
    disabled() {
      let result = false;

      if (this.superOptions.model.rules?.editable) {
        result = this.superOptions.model.rules.editable(this.item);
      }
      return !result;
    },
    deleteItem(e) {
      this.$emit("deleteItem", e);
    },
    editItem(e) {
      this.$emit("editItem", e);
    },
    formatTimestamp(timestamp) {
      if (timestamp) {
        const timezone = 'Africa/Johannesburg'; // replace with desired timezone
        const formattedDateInTimeZone = moment
            .tz(timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSSSSZ', 'UTC')
            .tz(timezone)
            .format('dddd, MMMM D, YYYY h:mm A');
        return formattedDateInTimeZone;
      } else {
        return null;
      }
    },
  },
};
</script>

<style scoped></style>
