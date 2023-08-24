<template>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">Upcoming Events</p>
      <p>Upcoming events for your school</p>

      <div v-for="(event, index) in events" :key="event" :id="'event-' + index">
        <div class="spacer"></div>
        <p class="medium">{{ event.title }}</p>
        <p>{{ event.description }}</p>
        <div class="rooms">
          <router-link
            v-for="room in event.roomIDs"
            :key="room"
            class="button"
            :to="'map?id=' + rooms[room].id"
          >
            {{ rooms[room].name }}
          </router-link>
        </div>
        <div class="event">
          <p>{{ displayTime(event.start, false, event.end) }}</p>
          <p>{{ displayTime(event.end, true) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import data from "../assets/data.json"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

export default {
  methods: {
    displayTime(date, end) {
      dayjs.extend(relativeTime)
      const hoursDifference = dayjs(date).diff(dayjs(), "hour")
      if (dayjs(date) > dayjs()) {
        if (hoursDifference > 24) {
          if (end) {
            return `Ends on ${dayjs(date).format("DD/MM/YYYY HH:mm:ss")}`
          } else {
            return `Starts on ${dayjs(date).format("DD/MM/YYYY HH:mm:ss")}`
          }
        } else {
          if (end) {
            return `Ends in ${dayjs(date).fromNow(true)}`
          } else {
            return `Starts in ${dayjs(date).fromNow(true)}`
          }
        }
      } else if (!end && dayjs(end) > dayjs()) {
        return "Happening now"
      } else if (end) {
        return "Event is over"
      }
    },
    dayjs(date) {
      return dayjs(date).format("DD/MM/YYYY HH:mm:ss")
    }
  },
  computed: {
    events() {
      return data.events
    },
    rooms() {
      return data.rooms
    }
  },
  mounted() {
    dayjs.extend(relativeTime)
  }
}
</script>
