<template>
  <div>
    <q-select
        v-model="internalModelValue"
        @input="updateValue"
        :options="items"
        :label="modelField.label"
        option-label="label"
        option-value="id"
        :disable="disabledComp"
        :loading="loading"
        :readonly="readonly"
        :dense="density === 'compact'"
        outlined
        :menu-props="{ offsetY: true }"
        :rules="rules"
        @click="activateAndFetchData"
    >
      <template v-slot:option="scope">
        <q-item v-if="scope.index === 0" class="q-mt-none q-px-md">
          <q-item-section>
            <q-input
                v-model="search"
                label="Search"
                dense
                outlined
                single-line
                hide-bottom-space
                class="q-mt-none q-pa-none"
            ></q-input>
          </q-item-section>
        </q-item>
        <q-item v-else-if="scope.index === items.length - 1" class="text-center q-pa-md">
          <q-pagination
              v-model="pagination.page"
              :max="totalPages"
              @input="fetchData"
              input
              class="q-ma-md"
          />
        </q-item>
        <q-item v-else v-bind="scope.itemProps" :key="scope.index" :label="scope.opt.label" :value="scope.opt.id">
          <q-item-section>
            {{ scope.opt.label }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>

function debounce(func, wait, immediate) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

import QuickListsHelpers from "./QuickListsHelpers";

export default {
  name: "SuperSelect",
  props: {
    modelValue: {
      type: [Number, Object],
      default: null,
    },
    filters: {
      type: String,
      default: "{}",
    },
    model: {
      type: [Object, Function],
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    modelField: {
      type: Object,
      default: () => ({}),
    },
    displayMapField: {
      type: Boolean,
      default: false,
    },
    excludedCols: {
      type: Array,
      default: () => [],
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    variant: {
      type: String,
      default: "outlined",
    },
    density: {
      type: String,
      default: "compact",
    },
    allowAll: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: () => ({}),
    },
    rules: {
      type: Array,
      default: () => ([() => true]),
    },
  },
  data() {
    return {
      timeout: null,
      search: "",
      pagination: {
        page: 1,
        limit: 5,
      },
      totalPages: 1,
      loading: false,
      fetchedItems: [],
      internalModelValue: this.modelValue,
      activated: false,
    };
  },
  computed: {
    disabledComp() {
      return this.disabled || this.readonly;
    },
    quickListsIsMobile() {
      return QuickListsHelpers.quickListsIsMobile();
    },
    title() {
      return this.headers.find((header) => header.field !== "id");
    },
    headers() {
      return QuickListsHelpers.SupaerTableHeaders(
          this.model,
          this.excludedCols,
          false,
          this.displayMapField
      );
    },
    items() {
      let result = [];
      if (!this.disabled) {
        result.push({ label: "", id: null });  // Empty item for search input
        result = [...result, ...this.fetchedItems.map(item => ({
          label: item[this.title.field],
          id: item.id
        }))];
        if (this.allowAll) {
          result.push({ label: "All", id: null });
        }
      }
      return result;
    },
    filtersComp() {
      const filters = JSON.parse(this.filters);
      if (this.title && this.search) {
        filters[this.title.field] = this.search;
      }
      return filters;
    },
  },
  methods: {
    updateValue(value) {
      this.$emit('update:modelValue', value);
    },
    async fetchData() {
      if (!this.activated) return;

      let linkables = [];
      if (this.modelField.fieldExtras?.relationRules?.linkables) {
        linkables = this.modelField.fieldExtras.relationRules.linkables(this.user);
      }

      this.loading = true;

      const response = await this.model.FetchAll(
          [],
          { ...linkables, order: "id.desc" },
          { Prefer: "count=exact" },
          {
            page: this.pagination.page,
            limit: this.pagination.limit,
            filters: this.filtersComp,
            clearPrimaryModelOnly: false,
          }
      );

      this.fetchedItems = response.response.data.data;
      this.totalPages = Math.ceil(response.response.data.total / this.pagination.limit);
      this.loading = false;
    },
    activateAndFetchData() {
      if (!this.activated) {
        this.activated = true;
        this.fetchData();
      }
    },
  },
  watch: {
    modelValue(val) {
      this.internalModelValue = val;
    },
    filters() {
      if (!this.disabled) {
        this.fetchData();
      }
    },
    search() {
      if (!this.disabled) {
        // this.fetchData();
        if (this.timeout) clearTimeout(this.timeout)
        this.timeout = setTimeout(() => {
          this.fetchData()
        }, 300)
      }
    },
  },
};
</script>

<style scoped></style>
