<template>
  <div>
    <InocanGoogleMap
        :center="modelValue"
        :zoom="zoom"
        map-type-id="terrain"
        style="height: 500px; width: 904px"
    >
      <template #default="{ api }">
        <InocanMarkerCluster :options="clusterOptions(api)">
          <InocanMarker
              api-key="AIzaSyAENUjZ_P7ulkAcDb-U8Htn6VSv_ioEKWE"
              v-for="(m, index) in markers"
              :key="index"
              @click="clickedMarker(m, index)"
              :options="{
              position: m.position,
              icon: markerOptionsMethod(m, index),
            }"
          />
        </InocanMarkerCluster>
      </template>
    </InocanGoogleMap>
  </div>
</template>

<script>
import { GoogleMap, Marker, MarkerCluster } from "vue3-google-map";

export default {
  name: "MyGoogleMap",
  components: {
    InocanGoogleMap: GoogleMap,
    InocanMarker: Marker,
    InocanMarkerCluster: MarkerCluster,
  },
  props: {
    markers: {
      type: Array,
      default() {
        return [];
      },
    },
    modelValue: {
      type: Object,
      default() {
        return {};
      },
    },
    zoom: {
      type: Number,
      default() {
        return 2;
      },
    },
  },
  data() {
    return {
      selectedPlaceIndex: null,
      iconAndLabelLabel: {
        icon: {
          url: "/mapIconCluster.svg",
        },
        label: {
          color: "white",
        },
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
  },
  methods: {
    iconAndLabelLabelMethod(count) {
      return {
        icon: this.iconAndLabelLabel.icon,
        label: {
          text: String(count),
          ...this.iconAndLabelLabel.label,
        },
      };
    },
    clusterOptions(api) {
      return {
        renderer: {
          render: ({ count, position }) =>
              new api.Marker({
                position,
                ...this.iconAndLabelLabelMethod(count),
                zIndex: 999 + count,
              }),
        },
      };
    },
    markerOptions(m) {
      return {
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
    markerOptionsMethod(m, index) {
      return index === this.selectedPlaceIndex
          ? this.selectedMarkerOptions(m)
          : this.markerOptions(m);
    },
    position(m) {
      return { lng: Number(m.lng), lat: Number(m.lat) };
    },
    clickedMarker(m, index) {
      this.$emit("update:modelValue", m.position);
      this.selectedPlaceIndex = index;
      this.$emit("clickMarker", m, index);
    },
  },
};
</script>

<style scoped></style>
