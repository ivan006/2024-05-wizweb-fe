<template>
  <div>
    <q-input
        :label="configs.label"
        v-model="internalModelValue"
        :error="false"
        :error-message="''"
        @click="showDialog = true"
        readonly
        outlined
        dense
    ></q-input>

    <q-dialog v-model="showDialog" max-width="500px">
      <q-card>
        <q-card-section>
          <h3>Search Place</h3>
          <q-input
              class="CustomPlaceSearch"
              label="Place"
              v-model="internalModelValue"
              :error="false"
              :error-message="''"
              ref="autocompleteInput"
              outlined
              dense
          ></q-input>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn color="primary" @click="showDialog = false">OK</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div style="display: none">
      <GMapAutocomplete
          placeholder="This is a placeholder"
          @place_changed="emitPlaceChanged"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchGooglePlace",
  props: {
    hideLabel: {
      type: Boolean,
      default() {
        return false;
      },
    },
    modelValue: {
      type: String,
      default: null,
    },
    configs: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      showDialog: false,
      retries: 0,
      place: null,
      internalModelValue: this.modelValue,
    };
  },
  watch: {
    modelValue(val) {
      this.internalModelValue = val;
    },
    showDialog(newVal) {
      if (newVal) {
        this.tryInit();
      }
    },
  },
  methods: {
    emitPlaceChanged(place) {
      this.place = place;
      if (place.geometry) {
        this.internalModelValue = place.name;
        this.$emit('update:modelValue', place.name);
      }
    },
    initAutocomplete() {
      const input = this.$refs.autocompleteInput.$el.querySelector('input');
      const autocomplete = new window.google.maps.places.Autocomplete(input);

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        this.emitPlaceChanged(place);
      });
    },
    tryInit() {
      if (
          this.$refs.autocompleteInput &&
          window.google &&
          window.google.maps &&
          window.google.maps.places
      ) {
        this.initAutocomplete();
      } else if (this.retries < 5) {
        this.retries++;
        setTimeout(this.tryInit, 1000); // Retry after 1 second
      } else {
        console.error('Failed to load Google Maps API after multiple attempts.');
      }
    },
  },
};
</script>

<style scoped>
.CustomPlaceSearch .q-field__control input[placeholder] {
  opacity: 0;
}
</style>
