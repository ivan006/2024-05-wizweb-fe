<template>
  <div>
    <q-btn
        no-caps
        class="button"
        style="margin: 2px;"
        @click="$emit('prev')"
        unelevated
        icon="arrow_left"
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
        icon-right="arrow_right"
    >
      Next
    </q-btn>
  </div>
</template>
<script setup lang="ts">
</script>