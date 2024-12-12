<template>
  <div class="q-mb-md">
    <q-breadcrumbs class="">
      <q-breadcrumbs-el
          v-for="(crumb, index) in breadcrumbTrail"
          :key="index"
          :label="crumb.label"
          class="text-subtitle2"
          @click="crumb.action"
      />
    </q-breadcrumbs>
    <BreadcrumbsFilterAutoSuggest
      :model="model"
    />
    <!--<pre>{{ filterVals }}</pre>-->
    <!--<pre>{{ filterNames }}</pre>-->
    <!--<pre>{{ routeParamValue }}</pre>-->
    <!--<pre>{{ boundRouteParam }}</pre>-->
    <!--<pre>{{ breadcrumbTrail }}</pre>-->
  </div>
</template>
<script>

import QuickListsHelpers from "./QuickListsHelpers";
import BreadcrumbsFilterAutoSuggest from "./BreadcrumbsFilterAutoSuggest.vue";

export default {
  name: "FilterBreadcrumbs",
  components: {BreadcrumbsFilterAutoSuggest},
  props: {
    model: {
      type: [Object, Function],
      required: true,
    },
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
      routeParamValue: [],
      filterValsRef: {},
      filterNamesRef: {},
    }
  },

  computed: {
    blankFilterVals() {
      return this.filterInputs.reduce((acc, filterInput) => {
        acc[filterInput.name] = null;
        return acc;
      }, {});
    },
    modelFields() {
      const result = QuickListsHelpers.computedAttrs(
          this.model,
          [],
      );
      return result;
    },
    filterInputs() {
      const data = this.modelFields;

      return QuickListsHelpers.filterInputs(data)
    },



    breadcrumbTrail() {
      const trail = [...this.trailPrefix];
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

      // Trim trailing default filter sets
      const trimmedParams = params.slice(0, (lastNonDefaultIndex + 1) * 3);

      // Build breadcrumbs from trimmed params
      for (let i = 0; i < trimmedParams.length; i += 3) {
        const key = trimmedParams[i];
        const name = trimmedParams[i + 2];

        trail.push(
            {
              label: this.formatKey(key),
              action: () => {
                // Reset this key and all lower levels to default
                const updatedVals = { ...this.filterVals };
                const updatedNames = { ...this.filterNames };

                // Reset current key and all lower levels
                Object.keys(updatedVals).forEach((filterKey, idx) => {
                  if (idx >= i / 3) { // Match key index and reset lower levels
                    updatedVals[filterKey] = 0;
                    updatedNames[filterKey] = "All";
                  }
                });

                // this.$emit("update:filterVals", updatedVals);
                // this.$emit("update:filterNames", updatedNames);
                this.filterValsRef = updatedVals
                this.filterNamesRef = updatedNames
              },
            },
            {
              label: name,
              action: () => {
                // Keep current name but reset all lower levels
                const updatedVals = { ...this.filterVals };
                const updatedNames = { ...this.filterNames };

                // Reset lower levels only
                Object.keys(updatedVals).forEach((filterKey, idx) => {
                  if (idx > i / 3) { // Match lower levels only
                    updatedVals[filterKey] = 0;
                    updatedNames[filterKey] = "All";
                  }
                });

                // this.$emit("update:filterVals", updatedVals);
                // this.$emit("update:filterNames", updatedNames);
                this.filterValsRef = updatedVals
                this.filterNamesRef = updatedNames
              },
            }
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
    decodeRouteParam() {

      // On page load, decode routeParamValue from route
      const routeParamValue = this.$route.params[this.boundRouteParam] || [];

      if (routeParamValue.length) {


        const newFilters = { ...this.filterVals }; // Start with all existing keys
        const newFilterNames = { ...this.filterNames }; // Start with all existing keys

        for (let i = 0; i < routeParamValue.length; i += 3) {
          const key = routeParamValue[i];
          newFilters[key] = parseInt(routeParamValue[i + 1], 10) || 0;
          newFilterNames[key] = routeParamValue[i + 2] || "All";
        }

        // Ensure all keys in the original filterVals and filterNames have a value
        Object.keys(this.blankFilterVals).forEach((key) => {
          if (!newFilters.hasOwnProperty(key)) {
            newFilters[key] = null;
          }
        });

        Object.keys(this.blankFilterVals).forEach((key) => {
          if (!newFilterNames.hasOwnProperty(key)) {
            newFilterNames[key] = null;
          }
        });

        // this.$emit("update:filterVals", newFilters);
        // this.$emit("update:filterNames", newFilterNames);
        this.filterValsRef = {...newFilters}
        this.filterNamesRef = {...newFilterNames}
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
  },
  watch: {
    // Watch filterVals and filterNames for changes
    // filterVals: {
    //   deep: true,
    //   handler() {
    //     this.updateRoute();
    //   },
    // },

    filterVals: {
      handler(newVal, oldVal) {
        // Use stringified comparison for deep change detection
        // if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        //   this.filterValsRef = {...newVal};
        // }
        this.updateRoute();
      },
      deep: true,
    },
    // filterValsRef: {
    //   handler(newVal, oldVal) {
    //     // Use stringified comparison to prevent unnecessary updates
    //     // if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    //     this.$emit("update:filterVals", newVal);
    //     // }
    //   },
    //   deep: true,
    // },

    filterNames: {
      handler(newVal, oldVal) {
        // Use stringified comparison for deep change detection
        // if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        //   this.filterNamesRef = {...newVal};
        // }
        this.updateRoute();
      },
      deep: true,
    },
    // filterNamesRef: {
    //   handler(newVal, oldVal) {
    //     // Use stringified comparison to prevent unnecessary updates
    //     // if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    //     this.$emit("update:filterNames", newVal);
    //     // }
    //   },
    //   deep: true,
    // },
  },
  mounted() {
    QuickListsHelpers.bindDeepPropToRef(this, [
      { prop: "filterVals", refName: "filterValsRef" },
      { prop: "filterNames", refName: "filterNamesRef" },
    ]);

    this.decodeRouteParam();
    // this.filterValsRef = this.blankFilterVals
    // this.filterNamesRef = this.blankFilterVals
    this.$emit("hasMounted");
  },
};
</script>
