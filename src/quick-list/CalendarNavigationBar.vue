<template>
  <div>
    <q-btn
        no-caps
        class="button"
        style="margin: 2px;"
        @click="$emit('today')"
        unelevated
    >
      Today
    </q-btn>
    <q-btn
        no-caps
        class="button"
        style="margin: 2px;"
        @click="$emit('prev')"
        unelevated
        icon="arrow_left"
    >
      <!--Previous-->
      <!--Back-->
    </q-btn>
    <q-btn
        no-caps
        class="button"
        style="margin: 2px;"
        @click="$emit('next')"
        unelevated
        icon-right="arrow_right"
    >
      <!--Next-->
      <!--Forward-->
    </q-btn>
  </div>
</template>
<script setup lang="ts">
</script>