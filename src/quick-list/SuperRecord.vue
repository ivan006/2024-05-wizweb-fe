<template>
  <div>

    <template v-if="treeMode">
      <SuperRecordTreeModeParent
          :configsCollection="configsCollection"
          :allowedTabs="allowedTabs"
          :templateOverview="templateOverview"
          :templateForm="templateForm"
          :model="model"
          :id="id"
          :displayMapField="displayMapField"
          :relationships="relationships"
          @editItem="editItem"
          @deleteItem="deleteItem"
          :update:item="$emit('update:item')"
          :item="item"
          :loading="loading"
          :canEdit="canEdit"
          :superOptions="superOptions"
      />
    </template>
    <template v-else>
      <SuperRecordTabMode
          :configsCollection="configsCollection"
          :allowedTabs="allowedTabs"
          :templateOverview="templateOverview"
          :templateForm="templateForm"
          :model="model"
          :id="id"
          :displayMapField="displayMapField"
          :relationships="relationships"
          @editItem="editItem"
          @deleteItem="deleteItem"
          :update:item="$emit('update:item')"
          :item="item"
          :loading="loading"
          :canEdit="canEdit"
          :superOptions="superOptions"
      />
    </template>
    <template v-if="canEdit">

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
              style="width: 700px; max-width: calc(-32px + 100vw);"
              :formServerErrors="formServerErrors"
          />
        </q-dialog>

        <q-dialog v-model="deleteItemData.showModal" >
          <q-card style="width: 500px; max-width: calc(-32px + 100vw);">
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
</template>

<script>
import SuperRecordTabMode from "./SuperRecordTabMode.vue";
import SuperRecordTreeModeParent from "./SuperRecordTreeModeParent.vue";
import CreateEditForm from "./CreateEditForm.vue";
import QuickListsHelpers from "./QuickListsHelpers";
import OverviewTab from "./OverviewTab.vue";

export default {
  name: "SuperRecord",
  components: {
    OverviewTab,
    CreateEditForm,
    SuperRecordTreeModeParent,
    SuperRecordTabMode,
  },
  props: {
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
    treeMode: {
      type: Boolean,
      default() {
        return false;
      },
    },
  },
  data(){
    return {

      deleteItemData: {
        showModal: false,
        data: null,
      },
      editItemData: {
        showModal: false,
        data: null,
      },
      formServerErrors: {},
      loading: true,
      initialLoadHappened: false,
      item: {},
    }
  },
  computed: {

    modelFields() {
      return QuickListsHelpers.computedAttrs(this.model, []);
    },
    canEdit() {
      return true;
    },
    superOptions() {

      return {
        headers: this.headers,
        modelFields: this.modelFields,
        displayMapField: this.displayMapField,
        model: this.model,
        canEdit: this.canEdit,
      };
    },
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(this.model, [], this.canEdit, this.displayMapField);
    },
  },
  methods: {

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

      this.superOptions.model.Update(payload)
          .then(() => {
            this.fetchData();
            this.editItemData.showModal = false;
            this.formServerErrors = {};
          })
          .catch((err) => {
            this.formServerErrors = err.response.data;
          });
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
    if(this.allowedTabs.length){
      this.activeTab = `tab-${this.allowedTabs[0]}`
    }
    this.fetchData();
  },
};
</script>

<style lang="scss">
</style>
