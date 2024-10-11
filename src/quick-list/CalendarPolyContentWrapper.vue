<template>
  <div>
    <!--<q-btn-toggle-->
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
    <div v-if="!allLoaded">
      <!-- Spinner or loading indicator -->
      <p>Loading...</p>
    </div>
    <!--<template v-if="configsFetched">-->
    <template v-if="true">

      <SuperCalendar
          v-if="allLoaded"
          :loading="!allLoaded"
          :mixedConfigs="mergedConfigs"
      />
      <!--<pre>{{console.log(mergedConfigs)}}</pre>-->
    </template>
    <!--&lt;!&ndash;:calendarMode="calendarMode"&ndash;&gt;-->
    <!--&lt;!&ndash; Hidden SuperTable for each model &ndash;&gt;-->
    <!--<div-->
    <!--    v-for="(dataType, index) in configsCollection"-->
    <!--    :key="index"-->
    <!--    style="display: none"-->
    <!--&gt;-->
    <!--  <SuperTable-->
    <!--      :model="dataType.model"-->
    <!--      :parentKeyValuePair="dataType.parentKeyValuePair"-->
    <!--      :templateListGrid="dataType.templateListGrid"-->
    <!--      :isForSelectingRelation="true"-->
    <!--      @clickRow="dataType.clickRow"-->
    <!--      :ref="getSuperTableRefKey(index)"-->
    <!--      @fetchComplete="handleDataFetched"-->
    <!--  />-->
    <!--</div>-->
  </div>
</template>

<script>
import SuperTable from "./SuperTable.vue"; // Adjust path as needed
import SuperCalendar from "./SuperCalendar.vue";
import {Helpers} from "../index"; // Adjust path as needed

export default {
  name: "CalendarPolyContentWrapper",
  components: {
    SuperTable,
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

          const superTable = this.$refs[this.getSuperTableRefKey(index)]?.[0];
          // const superOptions = superTable?.superOptions || {};

          // // Access inferred start and end fields from the computed array
          // const { startFieldName, endFieldName } = this.startAndEndFieldNames[index] || {};

          const startFieldName = Helpers.getFieldFromModelOrParent(childRelation.superOptions.headers, 'timeRangeStart');
          const endFieldName = Helpers.getFieldFromModelOrParent(childRelation.superOptions.headers, 'timeRangeEnd');

          const relatedModel = childRelation.field.meta.field.related
          console.log('relatedModel')
          console.log(relatedModel)
          // console.log(this.fetchedData[index]?.response?.data?.data)
          result.push({
            startFieldName,
            endFieldName,
            // items: this.mergedData[dataType.model.name],
            items: this.fetchedData[index]?.response?.data?.data || [],
            superOptions: childRelation.superOptions,

            unClickable: this.configsCollection[relatedModel.name]?.clickRow || (()=>{}),
            events: {
              clickRow: this.configsCollection[relatedModel.name]?.clickRow || (()=>{}),
              editItem: this.configsCollection[relatedModel.name]?.editItem || (()=>{}),
              deleteItem: this.configsCollection[relatedModel.name]?.deleteItem || (()=>{}),
            },
            templateListCalendar: this.configsCollection[relatedModel.name]?.templateListCalendar || {},
          });
        }
      };
      console.log('result')
      console.log(result)
      return result
    },


    // startAndEndFieldNames() {
    //   return this.configsCollection.map((dataType, index) => {
    //     const superTable = this.$refs[this.getSuperTableRefKey(index)]?.[0]; // Access SuperTable instance
    //
    //     if (!superTable) return { startFieldName: null, endFieldName: null };
    //
    //     const headers = superTable.superOptions.headers || {};
    //
    //     // Use the getFieldFromModelOrParent method to extract the field names
    //     const startFieldName = Helpers.getFieldFromModelOrParent(headers, 'timeRangeStart');
    //     const endFieldName = Helpers.getFieldFromModelOrParent(headers, 'timeRangeEnd');
    //
    //     return { startFieldName, endFieldName };
    //   });
    // },

  },
  mounted() {

    this.fetchAllModels();
    // // After mounting, check if each SuperTable's model has relevant calendar fields and fetch data
    // this.configsCollection.forEach((dataType, index) => {
    //   this.$nextTick(() => {
    //     this.configsFetched = true
    //     const refKey = this.getSuperTableRefKey(index);
    //     const superTable = this.$refs[refKey][0]; // Access the first element in the ref array
    //
    //     this.loadingStatus[dataType.model.name] = false;
    //
    //     if (superTable) {
    //       const headers = superTable.superOptions.headers || {};
    //       const hasCalendarFields = this.checkForCalendarFields(headers);
    //       if (hasCalendarFields) {
    //         superTable.activateAndFetchData();
    //       } else {
    //         this.loadingStatus[dataType.model.name] = true;
    //       }
    //     }
    //   });
    // });
  },
  methods: {

    filters(relation) {
      const parentKeyValuePair = this.parentKeyValuePair(relation)

      // console.log('parentKeyValuePair')
      // console.log(parentKeyValuePair)
      return {
        [parentKeyValuePair.parentFKey]: parentKeyValuePair.parentFVal,
      };
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
        // Create an array of promises by calling FetchAll() on each model
        const fetchPromises = this.childRelations.map((childRelation) => {
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
        });

        // Wait for all promises to resolve and store the results in an array
        const results = await Promise.all(fetchPromises);

        // Assign results to fetchedData, keeping the same index as models
        this.fetchedData = results;
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    },
    // getFieldFromModelOrParent(fields, usageType) {
    //   let targetField = null;
    //
    //   targetField = Object.values(fields).find(
    //       (field) => field.usageType === usageType
    //   );
    //   if (targetField) {
    //     return targetField.field;
    //   }
    //
    //   Object.values(fields).forEach((field) => {
    //     if (field.headerParentFields) {
    //       const parentField = field.headerParentFields.find(
    //           (parent) => parent.usageType === usageType
    //       );
    //       if (parentField) {
    //         targetField = parentField.name;
    //       }
    //     }
    //   });
    //
    //   return targetField;
    // },

    handleDataFetched(modelName, items) {
      // Find the dataType that corresponds to the modelName
      const dataType = this.configsCollection.find((dt) => dt.model.name === modelName);

      // Access the SuperTable ref to infer superOptions
      const superTable =
          this.$refs[
              this.getSuperTableRefKey(this.configsCollection.indexOf(dataType))
              ]?.[0];

      // Ensure superTable and its superOptions are available
      if (!superTable || !superTable.superOptions) return;

      // Get the headers (fields) for the current model from the SuperTable's superOptions
      const headers = superTable.superOptions.headers || {};

      // Process and normalize fetched data
      const processedItems = items.map((item) => {
        return item;
      });

      // Store the normalized data for this model under its model name
      // this.$set(this.mergedData, modelName, processedItems);
      this.mergedData[modelName] = processedItems

      // Mark this model as done fetching
      this.loadingStatus[modelName] = true;

      // Check if all data is fetched
      if (this.allLoaded) {
        console.log("All data fetched:", this.mergedData);
      }
    },
    getValueFromItem(item, fieldPath) {
      if (!fieldPath) return null;
      const fieldParts = fieldPath.split(".");
      const value = fieldParts.reduce((acc, part) => {
        return acc && acc[part] !== undefined ? acc[part] : null;
      }, item);

      return value;
    },
    checkForCalendarFields(fields) {
      const hasStartDateField = Helpers.getFieldFromModelOrParent(
          fields,
          "timeRangeStart",
      );
      const hasEndDateField = Helpers.getFieldFromModelOrParent(
          fields,
          "timeRangeEnd",
      );

      return hasStartDateField && hasEndDateField;
    },
    getSuperTableRefKey(index) {
      return `superTableRef-${index}`;
    },
  },
};
</script>

<style scoped>
/* No need for visible styles since SuperTable components are hidden */
</style>
