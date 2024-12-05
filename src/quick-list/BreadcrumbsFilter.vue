<template>
  <div class="q-mb-md">
    <q-breadcrumbs class="">
      <q-breadcrumbs-el
          v-for="(crumb, index) in breadcrumbTrail"
          :key="index"
          :label="crumb.label"
          class="text-subtitle2"
          :to="crumb.to"
      />
    </q-breadcrumbs>
    <!--<pre>{{ filterVals }}</pre>-->
    <!--<pre>{{ filterNames }}</pre>-->
    <!--<pre>{{ routeParamValue }}</pre>-->
    <!--<pre>{{ boundRouteParam }}</pre>-->
    <!--<pre>{{ breadcrumbTrail }}</pre>-->
  </div>
</template>
<script>

export default {
  name: "FilterBreadcrumbs",
  props: {
    boundRoute: {
      type: String,
      default: () => {
        return ""
      }
    },
    boundRouteParam: {
      type: String,
      default: () => {
        return ""
      }
    },
    filterVals: {
      type: Object,
      default: () => {
        return {}
      }
    },
    filterNames: {
      type: Object,
      default: () => {
        return {}
      }
    },
    trailPrefix: {
      type: Array,
      default: () => {
        return []
      }
    },
  },
  data(){
    return {
      routeParamValue: []
    }
  },
  computed: {



    breadcrumbTrail() {
      const trail = [...this.trailPrefix];

      for (let i = 0; i < this.routeParamValue.length; i += 3) {
        const key = this.routeParamValue[i];
        const id = this.routeParamValue[i + 1];
        const name = this.routeParamValue[i + 2];

        // Create separate breadcrumb objects for key and value
        trail.push(
            {label: this.formatKey(key)}, // Filter key as a separate breadcrumb
            {label: name} // Merged value (only the name) as a separate breadcrumb
        );
      }

      return trail;
    }
  },

  methods: {
    formatKey(key) {
      // Remove "_id" from the end if it exists
      let formattedKey = key.endsWith("_id") ? key.slice(0, -3) : key;

      // Convert snake_case to Title Case
      formattedKey = formattedKey
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ");

      return formattedKey;
    },
    // Decode routeParamValue (array) to populate filterVals and filterNames
    decodeRouteParam(routeParamValue) {
      const newFilters = {};
      const newfilterNames = {};

      for (let i = 0; i < routeParamValue.length; i += 3) {
        const key = routeParamValue[i];
        newFilters[key] = parseInt(routeParamValue[i + 1], 10) || 0;
        newfilterNames[key] = routeParamValue[i + 2] || "All";
      }

      return {
        newFilters,
        newfilterNames
      }
    },
    // Encode filters and filterNames into routeParamValue (array)
    encodeRouteParam() {
      const params = [];
      let lastNonDefaultIndex = -1;

      // Build params and track the last non-default filter set
      Object.keys(this.filterNames).forEach((key, index) => {
        const id = this.filterVals[key] !== null ? this.filterVals[key] : 0;
        const name = this.filterNames[key] !== null ? this.filterNames[key] : "All";

        params.push(key, id, name);

        // Check if this is a non-default filter
        if (id !== 0 || name !== "All") {
          lastNonDefaultIndex = index;
        }
      });

      // If all are default, return an empty array
      if (lastNonDefaultIndex === -1) {
        return [];
      }

      // Trim trailing default filter sets
      return params.slice(0, (lastNonDefaultIndex + 1) * 3); // Multiply by 3 to include full sets
    },

    // Update routeParamValue and route
    updateRoute() {
      this.routeParamValue = this.encodeRouteParam();

      this.$router.push({
        name: this.boundRoute, // Stay on the current route
        params: {
          ...this.$route.params, // Keep existing params
          [this.boundRouteParam]: this.routeParamValue, // Dynamically set the parameter name
        },
      });
    },
    updateRouteParamValue(newRouteParamValue) {

      const decoded = this.decodeRouteParam(newRouteParamValue || []);
      this.$emit("update:filterVals", decoded.newFilters);
      this.$emit("update:filterNames", decoded.newFilterNames);
    },
  },
  watch: {
    // Watch filterVals and filterNames for changes
    // filterVals: {
    //   deep: true,
    //   handler() {
    //     this.updateRoute();
    //   },
    // },
    filterNames: {
      deep: true,
      handler() {
        this.updateRoute();
      },
    },
  },
  mounted() {
    // On page load, decode routeParamValue from route
    const initialRouteParamValue = this.$route.params[this.boundRouteParam] || [];
    if (initialRouteParamValue.length) {

      this.updateRouteParamValue(initialRouteParamValue)
      // const decodeRouteParam = this.decodeRouteParam(initialRouteParamValue);
      //
      // this.$emit('update:filterVals', decodeRouteParam.newFilters)
      // this.$emit('update:filterNames', decodeRouteParam.newfilterNames)
      // // console.log('filterParams1')
      // // console.log(this.routeParamValue)
    }
  },
};
</script>
