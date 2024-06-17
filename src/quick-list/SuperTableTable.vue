<template>
  <div>
    <!--<pre>{{flattenedHeadersHideMapField}}</pre>-->
    <q-table
        class="qTable"
        :rows="items"
        :columns="flattenedHeadersHideMapField"
        row-key="id"
        :rows-per-page-options="[10, 20, 30, 50, 100]"
        :pagination.sync="pagination"
        :loading="loading"
        @request="onRequest"
    >
      <template v-slot:body="props">
        <q-tr :props="props" @click="clickRow(props.row)">
          <q-td
              v-for="header in flattenedHeaders"
              :key="header.field"
              :props="props"
          >
            <template v-if="header.isChildOf">
              <div>
                <FormattedColumn
                    :isTag="true"
                    :header="header"
                    :item="props.row[header.isChildOf.value]"
                    :superOptions="superOptions"
                    hideLabel
                />
              </div>
            </template>
            <template v-else>
              <div>
                <FormattedColumn
                    :header="header"
                    :item="props.row"
                    :superOptions="superOptions"
                    hideLabel
                />
              </div>
            </template>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import FormattedColumn from "./FormattedColumn.vue";

export default {
  name: "SuperTableTable",
  components: { FormattedColumn },
  props: {
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    options: {
      type: Object,
      default() {
        return {};
      },
    },
    itemsLength: {
      type: Number,
      default() {
        return null;
      },
    },
    loading: {
      type: Boolean,
      default() {
        return false;
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
      sortBy: [],
      // loading: false,
      pagination: {
        page: 1,
        rowsPerPage: 10,
        sortBy: [],
        descending: false,
      },
    };
  },
  computed: {
    pKey() {
      return this.superOptions.model.primaryKey;
    },
    optionsComputed: {
      get() {
        return this.options;
      },
      set(value) {
        this.$emit("update:options", value);
      },
    },
    flattenedHeaders() {
      let result = [];
      for (const header of this.superOptions.headers) {
        result.push(header);
        if (header.headerChildren) {
          for (const childHeader of header.headerChildren) {
            result.push({
              // isChildOf: header,
              ...childHeader,
            });
          }
        }
      }
      return result;
    },
    flattenedHeadersHideMapField() {
      let result = [];
      for (const header of this.flattenedHeaders) {
        if (!this.superOptions.superOptions) {
          if (
              !header.usageType.startsWith("relLookupMapExtra") &&
              !header.usageType.startsWith("mapExtra")
          ) {
            result.push(header);
          }
        } else {
          result.push(header);
        }
      }
      return result;
    },
  },
  methods: {
    updateOptions(e) {
      this.$emit("update:options", e);
    },
    deleteItem(e) {
      this.$emit("deleteItem", e);
    },
    editItem(e) {
      this.$emit("editItem", e);
    },
    clickRow(row) {
      this.$emit("clickRow", row);
    },
    onRequest(props) {
      const { page, rowsPerPage, sortBy, descending } = props.pagination;
      this.pagination = {
        ...this.pagination,
        page,
        rowsPerPage,
        sortBy,
        descending,
      };
      this.$emit("update:options", { page, rowsPerPage, sortBy, descending });
    },
  },
  watch: {
    options: {
      handler(newOptions) {
        this.pagination = {
          ...this.pagination,
          page: newOptions.page,
          rowsPerPage: newOptions.itemsPerPage,
          sortBy: newOptions.sortBy[0]?.key || this.pKey,
          descending: newOptions.sortBy[0]?.order === "desc" || false,
        };
      },
      deep: true,
    },
    "editItemData.showModal"(arg) {
      if (!arg) {
        this.editItemData.data = {};
      }
    },
  },
  mounted() {
    this.sortBy = [{key: this.pKey, order: "asc"}];
  },
};
</script>

<style scoped>

.qTable .q-tr {
  cursor: pointer;
}

.qTable {
  box-shadow: none !important;
}
</style>
