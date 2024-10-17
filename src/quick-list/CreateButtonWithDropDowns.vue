<template>
  <div>
    <!--@click="emitCreateItem"-->
    <q-btn-dropdown
        :disable="!canEdit"
        outline
        class="q-mb-md"
        :label="createButtonText ? createButtonText : 'New'"
    >
      <q-list style="min-width: 120px">
        <q-item
            v-for="(model, index) in modelTypes"
            :key="index"
            clickable
            @click="emitCreateItem(index)">
          <q-item-section>
            {{ model.label }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <q-tooltip v-if="canCreateMsg.length" bottom :disable="canCreatePart2">
      <span>{{ canCreateMsg }}</span>
    </q-tooltip>
    <templace v-for="(modelType, index) in modelTypes">
      <CrudModal
          @fetchData="this.fetchData(modelType.meta, index)"
          :ref="`CrudModalRef${index}`"
          :superOptions="modelType.meta.superOptions"
          :parentKeyValuePair="parentKeyValuePair(modelType.meta)"
      />
    </templace>
  </div>
</template>

<script>
import CrudModal from "./CrudModal.vue";
import {defineAsyncComponent} from "vue";

export default {
  name: "CreateButtonWithDropDowns",
  components: {
    CrudModal
    // CrudModal,
  },
  props: {
    parentKeyValuePair: {
      type: Function,
      default: ()=>{},
    },
    fetchData: {
      type: Function,
      default: ()=>{},
    },
    childRelations: {
      type: Array,
      default: [],
    },
    canEdit: {
      type: Boolean,
      default: true,
    },
    createButtonText: {
      type: String,
      default: '',
    },
    canCreateMsg: {
      type: String,
      default: '',
    },
    canCreatePart2: {
      type: Boolean,
      default: false,
    },
    // modelTypes: {
    //   type: Array,
    //   default: () => [
    //     { label: 'Type 1', value: 'type1' },
    //     { label: 'Type 2', value: 'type2' },
    //     { label: 'Type 3', value: 'type3' },
    //   ],
    // },
  },
  computed: {
    modelTypes(){
      const result = []
      for (const childRelation of this.childRelations) {

        if (childRelation.canBeCalendared){
          result.push({
            label: childRelation.field.meta.field.related.name,
            value: childRelation.field.meta.field.related.name,
            meta: childRelation,
          })
        }
      }
      return result
    }
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
    emitCreateItem(index) {
      console.log( index)
      console.log( `CrudModalRef${index}`)
      console.log( this.$refs[`CrudModalRef${index}`][0])
      this.$refs[`CrudModalRef${index}`][0].createItem()
      this.$emit('create-item', index);
    },
  },
};
</script>

<style scoped>

</style>