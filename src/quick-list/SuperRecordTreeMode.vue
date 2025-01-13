<template>
  <div>
    <q-tree
        :nodes="treeData"
        node-key="id"
        :default-expand-all="true"
        @lazy-load="handleLazyLoad"
        @toggle="handleToggle"
    >
      <template v-slot:default="props">
        <div>
          <div v-if="props.node.type === 'record'">
            <strong>{{ props.node.label }}</strong>
          </div>

          <div v-else-if="props.node.type === 'attr'">
            {{ props.node.label }}: {{ props.node.value }}
          </div>

          <div v-else-if="props.node.type === 'relation'">
            <em>{{ props.node.label }}</em>
          </div>
        </div>
      </template>
    </q-tree>
  </div>
</template>

<script>
export default {
  name: "SuperRecordTreeMode",
  components: {},
  props: {
    configsCollection: {
      type: Object,
      default: () => ({}),
    },
    allowedTabs: {
      type: Array,
      default: () => [],
    },
    templateOverview: {
      type: Object,
      default: () => ({}),
    },
    templateForm: {
      type: Object,
      default: () => ({}),
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
      default: () => [],
    },
  },
  data() {
    return {
      treeData: [],
      loading: false,
    };
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const response = await this.model.FetchById(this.id, this.relationships);
        this.treeData = this.prepareTreeData(response.response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },

    prepareTreeData(record) {
      const attrs = Object.keys(record)
          .filter(key => typeof record[key] !== "object")
          .map(key => ({
            type: "attr",
            label: key,
            value: record[key],
          }));

      const childGroups = this.relationships.map(relation => ({
        type: "relation",
        label: relation.label || relation.name,
        lazy: true,
        children: [],
        model: relation.relatedModel,
        parentId: this.id,
      }));

      return [
        {
          type: "record",
          label: this.model.entity,
          children: [...attrs, ...childGroups],
        },
      ];
    },

    handleLazyLoad(node, done) {
      if (node.type !== "relation" || !node.lazy) {
        done();
        return;
      }

      const relationModel = node.model;
      const parentId = node.parentId;

      relationModel.Fetch({filters: {parent_id: parentId}})
          .then(response => {
            node.children = response.response.data.data.map(record => ({
              type: "record",
              label: relationModel.entity,
              children: this.prepareTreeData(record)[0].children,
            }));
          })
          .catch(error => {
            console.error("Error fetching child data:", error);
          })
          .finally(() => done());
    },

    handleToggle(node) {
      console.log("Toggled node:", node);
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style lang="scss">
</style>
