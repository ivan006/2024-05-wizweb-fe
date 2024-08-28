<template>
  <div>
    <q-card class="q-pa-xs">

      <MyGoogleMap
          v-if="markers.length"
          :markers="markers"
          v-model="center"
          :zoom="zoom"
          @clickMarker="clickedMarker"
      />
    </q-card>

    <q-dialog v-model="viewItemData.showModal" max-width="800px">
      <q-card class="q-pt-md">
        <q-card-section>
          <RecordFieldsForDisplayGeneric
              :item="viewItemData.data"
              :superOptions="superOptions"
              @editItem="editItem"
              @deleteItem="deleteItem"
          />
        </q-card-section>

        <q-card-actions>
          <q-btn @click="clickRow(viewItemData.data)" flat label="Open" />
          <q-btn @click="viewItemData.showModal = false" flat label="Cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import RecordFieldsForDisplayGeneric from "./RecordFieldsForDisplayGeneric.vue";
import MyGoogleMap from "./MyGoogleMap.vue";
import { useGeolocation } from "@vueuse/core";
import DatapointForDisplayInner from "./DatapointForDisplayInner.vue";

export default {
  name: "SuperTableMap",
  components: {
    DatapointForDisplayInner,
    MyGoogleMap,
    RecordFieldsForDisplayGeneric,
  },
  props: {
    items: {
      type: Array,
      default() {
        return [];
      },
    },
    mapHeaders: {
      type: Array,
      default() {
        return [];
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
    const geolocation = useGeolocation();
    return {
      locationHasBeenGranted: false,
      zoom: 2,
      geolocation: geolocation,
      center: { lat: 0, lng: 0 },
      geoLocate: {},
      selectedPlaceIndex: null,
      clusterStyle: {
        textColor: "white",
        url: "/mapIconCluster.svg",
        anchorText: [1.5, 1],
      },
      viewItemData: {
        showModal: false,
        data: {},
      },
    };
  },
  computed: {
    clusterStyles() {
      return [
        { ...this.clusterStyle, height: 40, width: 40 },
        { ...this.clusterStyle, height: 40, width: 40 },
        { ...this.clusterStyle, height: 40, width: 40 },
        { ...this.clusterStyle, height: 40, width: 40 },
        { ...this.clusterStyle, height: 40, width: 40 },
      ];
    },
    markers() {
      let result = [];
      let longField = this.mapHeaders.find((field) => {
        return field.usageType == "mapExtraGeoLocLong";
      });
      let latField = this.mapHeaders.find((field) => {
        return field.usageType == "mapExtraGeoLocLat";
      });
      console.log(longField)
      if (latField && longField) {
        for (const item of this.items) {
          if (![null, ""].includes(item[latField.name])) {
            result.push({
              position: {
                lat: +item[latField.name],
                lng: +item[longField.name],
              },
              keys: {
                long: longField.name,
                lat: latField.name,
              },
              meta: item,
            });
          }
        }
      } else {
        let mapHeaderParent = "";
        for (const mapHeader of this.mapHeaders) {
          mapHeaderParent = mapHeader.field;
          if (mapHeader.headerParentFields) {
            longField = mapHeader.headerParentFields.find((field) => {
              return field.usageType == "mapExtraGeoLocLong";
            });
            latField = mapHeader.headerParentFields.find((field) => {
              return field.usageType == "mapExtraGeoLocLat";
            });

            if (latField && longField) {
              break;
            }
          }
        }


        if (latField && longField) {
          for (const item of this.items) {
            if (item[latField.name] !== null) {
              result.push({
                position: {
                  lat: item[mapHeaderParent][latField.name],
                  lng: item[mapHeaderParent][longField.name],
                },
                keys: {
                  long: longField.name,
                  lat: latField.name,
                },
                meta: item,
              });
            }
          }
        }
      }

      return result;
    },
  },
  methods: {
    deleteItem(e) {
      this.$emit("deleteItem", e);
    },
    editItem(e) {
      this.$emit("editItem", e);
    },
    clickRow(e) {
      this.viewItemData.showModal = false;
      this.$emit("clickRow", e[this.superOptions.model.primaryKey], e);
    },
    position(m) {
      return { lng: Number(m.lng), lat: Number(m.lat) };
    },
    positionString(m) {
      return m.lat + ", " + m.lng;
    },
    markerOptionsMethod(m, index) {
      const result =
          index == this.selectedPlaceIndex
              ? this.selectedMarkerOptions(m, index)
              : this.markerOptions(m, index);
      return result;
    },
    clickedMarker(m, index) {
      this.viewItemData.showModal = true;
      this.viewItemData.data = m.meta;
      this.selectedPlaceIndex = index;
    },
    markerOptions(m) {
      return {
        id: m.meta.id,
        url: "/mapIconPin.svg",
        size: { width: 30, height: 30, f: "px", b: "px" },
        scaledSize: { width: 30, height: 30, f: "px", b: "px" },
      };
    },
    selectedMarkerOptions(m) {
      return {
        id: m.meta.id,
        url: "/mapIconPin.svg",
        size: { width: 40, height: 40, f: "px", b: "px" },
        scaledSize: { width: 40, height: 40, f: "px", b: "px" },
      };
    },
  },
  mounted() {},
  watch: {
    "geolocation.coords.latitude"() {
      if (!this.locationHasBeenGranted) {
        this.locationHasBeenGranted = true;

        this.center = {
          lng: this.geolocation.coords.longitude,
          lat: this.geolocation.coords.latitude,
        };

        let result = 2;
        if (
            this.geolocation.coords.accuracy <= 100 ||
            this.geolocation.coords.altitude
        ) {
          result = 9; // High accuracy (typically GPS-based)
        } else if (this.geolocation.coords.accuracy <= 1000) {
          result = 8; // Moderate accuracy
        } else {
          result = 7; // Low accuracy (e.g., IP-based)
        }
        this.zoom = result;
      }
    },
  },
};
</script>

<style>
.GmapMap .vue-map {
  border-radius: 4px !important;
}
</style>
