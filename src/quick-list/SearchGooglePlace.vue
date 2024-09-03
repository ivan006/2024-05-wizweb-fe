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
  </div>
</template>

<script>
import {Loader} from '@googlemaps/js-api-loader';

export default {
  name: "SearchGooglePlace",
  props: {
    hideLabel: {
      type: Boolean,
      default: false,
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
        this.initGoogleMaps();
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
    initGoogleMaps() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_API_GOOGLE_MAP_KEY,  // Replace with your actual API key
        libraries: ['places'],
      });

      loader.load().then(() => {
        const input = this.$refs.autocompleteInput.$el.querySelector('input');
        const autocomplete = new google.maps.places.Autocomplete(input);

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          this.emitPlaceChanged(place);
        });
      }).catch((error) => {
        console.error('Failed to load Google Maps API:', error);
      });
    },
  },
};
</script>

<style scoped>
.CustomPlaceSearch .q-field__control input[placeholder] {
  opacity: 0;
}
</style>
