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
                @keyup.enter="fetchData"
            ></q-input>
          </q-item-section>
        </q-item>
        <q-item v-else-if="scope.index === items.length - 1 && showMoreButtonVisible" @click="showMore" class="text-center q-pa-md">
          <q-item-section>
            Show More
          </q-item-section>
        </q-item>
        <q-item v-else :key="scope.index" :label="scope.opt.label" :value="scope.opt.id">
          <q-item-section>
            {{ scope.opt.label }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script>
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
  },
  data() {
    return {
      search: "",
      pagination: {
        page: 1,
        limit: 5,
      },
      loading: false,
      noMoreShowMore: false,
      fetchedItems: [],
      internalModelValue: this.modelValue,
    };
  },
  computed: {
    disabledComp() {
      return this.disabled || this.readonly;
    },
    showMoreButtonVisible() {
      return this.pagination.limit < this.items.length && !this.noMoreShowMore;
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
        result.push({ label: "", id: null });  // Empty item for show more button
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
    showMore() {
      this.pagination.page++;
      this.fetchData();
    },
    async fetchData() {
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

      if (response.response.data.length === 0) {
        this.noMoreShowMore = true;
      }
      this.fetchedItems = [...this.fetchedItems, ...response.response.data.data];
      this.loading = false;
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
        this.fetchData();
      }
    },
  },
  mounted() {
    if (!this.disabled) {
      this.fetchData();
    }
  },
};
</script>

<style scoped></style>
