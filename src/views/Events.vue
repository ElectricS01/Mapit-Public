<template>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">Upcoming Events</p>
      <p>Upcoming events for your school</p>

      <div
        v-for="(event, index) in data.events"
        :id="'event-' + index"
        :key="event"
      >
        <div class="spacer" />
        <p class="medium">
          {{ event.title }}
        </p>
        <p>{{ event.description }}</p>
        <div class="rooms">
          <router-link
            v-for="room in event.roomIDs"
            :key="room"
            class="button"
            :to="
              'map?id=' +
              rooms.find((e) => e.id === room || e.roomId === room)?.name
            "
          >
            {{ rooms.find((e) => e.id === room || e.roomId === room)?.name }}
          </router-link>
        </div>
        <div class="event">
          <p>{{ displayTime(event.start, false) }}</p>
          <p>{{ displayTime(event.end, true) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import data from "../assets/data.json"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

const rooms = data.standard
  .concat(data.rooms)
  .concat(data.blocks)
  .filter((value) => Object.keys(value).length !== 0 && value.name)

const displayTime = (date, end) => {
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
}
</script>
