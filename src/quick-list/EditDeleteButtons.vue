<template>
  <div>

    <q-btn
        @click="editItem(item)"
        :disable="disabled()"
        color="grey"
        icon="edit"
        flat
        size="sm"
    />
    <q-btn
        @click="deleteItem(item)"
        :disable="disabled()"
        color="grey"
        icon="delete"
        flat
        size="sm"
    />



    <CrudModal
        :templateForm="templateForm"
        @fetchData="fetchData"
        ref="CrudModalRef"
        :superOptions="superOptions"
        :parentKeyValuePair="parentKeyValuePair"
    />
  </div>
</template>

<script>
import CrudModal from "./CrudModal.vue";

export default {
  name: "EditDeleteButtons",
  components: {CrudModal},
  props: {
    canEdit: false,
    item: {},
    superOptions: {},
    parentKeyValuePair: {},
    templateForm: {},
  },
  methods:{

    deleteItem(item) {
      this.$refs.CrudModalRef.deleteItem(item);
    },
    editItem(item) {
      this.$refs.CrudModalRef.editItem(item);
    },
    fetchData(item) {
      this.$emit("fetchData", item);
    },
    disabled() {
      let result = false;

      if (this.superOptions.model.rules?.editable) {
        result = this.superOptions.model.rules.editable(this.item);
      }
      return !result;
    },
  }
}
</script>

<style scoped>

</style>