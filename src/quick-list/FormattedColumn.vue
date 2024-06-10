<template>
  <div>
    <template v-if="header.usageType.startsWith('relChildren')"></template>
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

      <template v-if="superOptions.canEdit">
        <q-dialog v-model="editItemData.showModal">
          <CreateEditForm
              title="Edit Item"
              v-if="editItemData.showModal"
              v-model="editItemData.data"
              @submit="editItemSubmit"
              @cancel="editItemData.showModal = false"
              :superOptions="superOptions"
              style="width: 700px; max-width: 80vw;"
            />
        </q-dialog>

        <q-dialog v-model="deleteItemData.showModal" max-width="600px">
          <q-card>
            <q-card-section>
              <div class="text-h6">Delete Item</div>
            </q-card-section>
            <q-card-section>
              <p>Delete item?</p>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn @click="deleteItemData.showModal = false" flat>Cancel</q-btn>
              <q-btn @click="deleteItemSubmit" flat>Delete</q-btn>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </template>
    </template>
    <template v-else-if="header.usageType.startsWith('relLookup')">
      <div style="min-height: 32px">
        <q-chip
            v-if="item?.[header.field]?.[header.meta.lookupDisplayField]"
            @click.stop="clickParent(item?.[header.field], header)"
        >
          {{ item?.[header.field]?.[header.meta.lookupDisplayField] }}
        </q-chip>
      </div>
    </template>
    <template v-else>
      <template v-if="isTag">
        <q-chip v-if="isTag" @click.stop="clickParent(item)">
          {{ item[header.field] }}
        </q-chip>
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
          user: {},
        };
      },
    },
  },
  data() {
    return {
      deleteItemData: {
        showModal: false,
        data: null,
      },
      editItemData: {
        showModal: false,
        data: null,
      },
    };
  },
  methods: {
    clickParent(item, header) {
      const model = header.meta.relatedModel;
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
        result = this.superOptions.model.rules.editable(this.superOptions.user, this.item);
      }
      return !result;
    },
    deleteItem(item) {
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
      this.editItemData.data = {...item};
      this.editItemData.showModal = true;
    },
    editItemSubmit() {
      const payload = QuickListsHelpers.preparePayload(
          this.editItemData.data,
          this.superOptions.modelFields
      );
      this.superOptions.model.Update(payload).then(() => {
        this.fetchData();
      });
      this.editItemData.showModal = false;
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
