<template>
  <div>
    <div v-if="loading">
      <div class="text-center q-pa-md">Loading...</div>
    </div>
    <template v-else>
      <CreateButtonWithDropDowns
          :childRelations="childRelations"
          @create-item="createItem"
          :fetchData="fetchData"
          :parentKeyValuePair="parentKeyValuePair"
      />
      <SuperCalendar
          ref="SuperCalendar"
          @editItem="editItem"
          @deleteItem="deleteItem"
          :loading="loading"
          :mixedConfigs="mergedConfigs"
      />

      <template v-for="(childRelation, index) in childRelations">
        <CrudModal
            @deleteComplete="actionComplete"
            @editComplete="actionComplete"
            @fetchData="fetchData(childRelation, index)"
            :ref="`CrudModalRef${index}`"
            :superOptions="childRelation.superOptions"
            :parentKeyValuePair="parentKeyValuePair(childRelation)"
        />
      </template>
    </template>
  </div>
</template>

<script>
import SuperCalendar from "./SuperCalendar.vue";
import {Helpers} from "../index";
import CreateButtonWithDropDowns from "./CreateButtonWithDropDowns.vue";
import CrudModal from "./CrudModal.vue"; // Adjust path as needed

export default {
  name: "CalendarPolyContentWrapper",
  components: {
    CrudModal,
    CreateButtonWithDropDowns,
    SuperCalendar,
  },
  props: {
    configsCollection: {
      type: Object,
      // required: true,
      default: {},
    },
    childRelations: {
      type: Array,
      required: true, // An array of objects, each containing model, clickRow, parentKeyValuePair, and templateListGrid
    },
    parentPrimaryKey: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      // calendarMode: 'List',
      loading: true,
      loadingStatus: {},
      mergedData: [], // Holds the merged data from all SuperTables
      configsFetched: false, // Holds the merged data from all SuperTables
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        groupBy: [],
      },
      fetchedData: [],
    };
  },
  computed: {
    allLoaded() {
      // Check if all models have completed loading
      return Object.values(this.loadingStatus).every(
          (status) => status === true,
      );
    },
    mergedConfigs() {

      const result = []
      // for (const [index, childRelation] of this.childRelations) {

      for (const index in this.childRelations) {
        const childRelation = this.childRelations[index]

        if (childRelation.canBeCalendared){

          // const superTable = this.$refs[this.getSuperTableRefKey(index)]?.[0];
          // const superOptions = superTable?.superOptions || {};

          // // Access inferred start and end fields from the computed array
          // const { startFieldName, endFieldName } = this.startAndEndFieldNames[index] || {};

          const startFieldName = Helpers.getFieldFromModelOrParent(childRelation.superOptions.headers, 'timeRangeStart');
          const endFieldName = Helpers.getFieldFromModelOrParent(childRelation.superOptions.headers, 'timeRangeEnd');

          const relatedModel = childRelation.field.meta.field.related

          result.push({
            startFieldName,
            endFieldName,
            // items: this.mergedData[dataType.model.name],
            items: this.fetchedData[index]?.response?.data?.data || [],
            superOptions: childRelation.superOptions,

            unClickable: this.configsCollection[relatedModel.name]?.clickRow || (()=>{}),
            // events: {
            //   clickRow: this.configsCollection[relatedModel.name]?.clickRow || (()=>{}),
            //   editItem: this.configsCollection[relatedModel.name]?.editItem || (()=>{}),
            //   deleteItem: this.configsCollection[relatedModel.name]?.deleteItem || (()=>{}),
            // },
            templateListCalendar: this.configsCollection[relatedModel.name]?.templateListCalendar || {},
          });
        }
      };

      return result
    },




  },
  mounted() {

    this.fetchAllModels();
  },
  methods: {
    actionComplete(){
      this.$refs.SuperCalendar.viewItemData.showModal = false
    },
    createItem(e){
      this.$refs[`CrudModalRef${e}`][0].createItem()
    },
    editItem(item, e){
      this.$refs[`CrudModalRef${e}`][0].editItem(item)
    },
    deleteItem(item, e){
      this.$refs[`CrudModalRef${e}`][0].deleteItem(item)
    },
    async fetchData(childRelation, index) {
      try {
        const results = await this.fetchItem(childRelation)

        this.fetchedData[index] = results;
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    },

    fetchItem(childRelation) {
      const relatedModel = childRelation.field.meta.field.related
      let rules = [];
      // everything from here down could be in helper methods
      if (relatedModel.rules?.readables) {
        rules = relatedModel.rules.readables();
      }

      const extraHeaderComputed = {};
      const flagsComputed = {
        sort: `-${relatedModel.primaryKey}`,
        per_page: this.options.itemsPerPage,
        page: this.options.page,
      };

      return relatedModel.FetchAll(
          [],
          {
            ...rules,
            ...flagsComputed
          },
          extraHeaderComputed,
          {
            page: this.options.page,
            limit: this.options.itemsPerPage,
            filters: this.filters(childRelation),
            clearPrimaryModelOnly: false,
          },
      )
    },

    filters(relation) {
      const parentKeyValuePair = this.parentKeyValuePair(relation)

      // console.log('parentKeyValuePair')
      // console.log(parentKeyValuePair)
      const result = {
        [parentKeyValuePair.parentFKey]: parentKeyValuePair.parentFVal,
      };

      return result
    },
    parentKeyValuePair(relation) {
      const fKey = relation.field.meta.field.foreignKey

      const result = {
        parentFKey: fKey,
        parentFVal: this.parentPrimaryKey,
      }

      return result
    },
    async fetchAllModels() {
      try {
        this.loading = true;
        // Create an array of promises by calling FetchAll() on each model
        const fetchPromises = this.childRelations.map((childRelation) => {
          return this.fetchItem(childRelation)
        });

        // Wait for all promises to resolve and store the results in an array
        const results = await Promise.all(fetchPromises);

        // Assign results to fetchedData, keeping the same index as models
        this.fetchedData = results;

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
/* No need for visible styles since SuperTable components are hidden */
</style>
