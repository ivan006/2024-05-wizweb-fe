<template>
  <div class="q-mb-md">
    <q-breadcrumbs  class="">
      <q-breadcrumbs-el
        v-for="(crumb, index) in breadcrumbTrail"
        :key="index"
        :label="crumb.label"
        class="text-subtitle2"
      />
    </q-breadcrumbs>
    <!--<pre>{{ filterVals }}</pre>-->
    <!--<pre>{{ filterNames }}</pre>-->
    <!--<pre>{{ filterParams }}</pre>-->
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
      filterParams: []
    }
  },
  computed: {




    breadcrumbTrail() {
      const trail = this.trailPrefix;

      for (let i = 0; i < this.filterParams.length; i += 3) {
        const key = this.filterParams[i];
        const id = this.filterParams[i + 1];
        const name = this.filterParams[i + 2];

        // Create separate breadcrumb objects for key and value
        trail.push(
          { label: this.formatKey(key) }, // Filter key as a separate breadcrumb
          { label: name } // Merged value (only the name) as a separate breadcrumb
        );
      }

      return trail;
    },
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
    // Decode filterParams (array) to populate filterVals and filterNames
    filterParamsDecode(filterParams) {
      const newFilters = {};
      const newfilterNames = {};

      for (let i = 0; i < filterParams.length; i += 3) {
        const key = filterParams[i];
        newFilters[key] = parseInt(filterParams[i + 1], 10) || 0;
        newfilterNames[key] = filterParams[i + 2] || "All";
      }

      return {
        newFilters,
        newfilterNames
      }
    },
    // Encode filters and filterNames into filterParams (array)
    filterParamsEncode() {
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

    // Update filterParams and route
    updateRoute() {
      this.filterParams = this.filterParamsEncode();
      this.$router.push({
        name: this.boundRoute, // Stay on the current route
        params: {
          ...this.$route.params, // Keep existing params
          [this.boundRouteParam]: this.filterParams, // Dynamically set the parameter name
        },
      });
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
    // On page load, decode filterParams from route
    const initialFilterParams = this.$route.params[this.boundRouteParam] || [];
    if (initialFilterParams.length) {
      const filterParamsDecode = this.filterParamsDecode(initialFilterParams);

      this.$emit('update:filterVals', filterParamsDecode.newFilters)
      this.$emit('update:filterNames', filterParamsDecode.newfilterNames)
      // console.log('filterParams1')
      // console.log(this.filterParams)
    }
  },
};
</script>
