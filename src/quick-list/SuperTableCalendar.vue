<template>
  <div class="subcontent">
    <!--<navigation-bar-->
    <!--    @today="onToday"-->
    <!--    @prev="onPrev"-->
    <!--    @next="onNext"-->
    <!--/>-->

    <div class="row justify-center">
      <div style="display: flex; max-width: 800px; width: 100%; height: 400px;">
        <q-calendar-day
            ref="calendar"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { QCalendarDay, today } from '@quasar/quasar-ui-qcalendar/src/index.js'
import '@quasar/quasar-ui-qcalendar/src/QCalendarVariables.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarTransitions.sass'
import '@quasar/quasar-ui-qcalendar/src/QCalendarDay.sass'

import { defineComponent } from 'vue'
// import NavigationBar from '../components/NavigationBar.vue'

export default defineComponent({
  name: 'DayDark',
  components: {
    // NavigationBar,
    QCalendarDay
  },
  data () {
    return {
      selectedDate: today()
    }
  },
  methods: {
  }
})
</script>