<template>
  <div>

    <q-btn
        no-caps
        class="button"
        style="margin: 2px;"
        @click="$emit('prev')"
        unelevated
    >
      Previous
    </q-btn>
    <q-btn
        no-caps
        class="button"
        style="margin: 2px;"
        @click="$emit('today')"
        unelevated
    >
      Now
    </q-btn>
    <q-btn
        no-caps
        class="button"
        style="margin: 2px;"
        @click="$emit('next')"
        unelevated
    >
      Next
    </q-btn>
  </div>
</template>
<script setup lang="ts">
</script>