<template>
  <div class="container-flex">
    <div class="map-container">
      <div class="map-page">
        <div class="map">
          <div
            v-for="room in standardRooms"
            @click="show(room.name)"
            class="map-item"
            :class="{ selected: isHighlighted === room.id }"
            :style="{
              width: room.width + 'px',
              height: room.height + 'px',
              left: room.x + 'px',
              top: room.y + 'px'
            }"
          >
            {{ room.name }}
          </div>
          <div
            v-for="block in data.blocks"
            class="block"
            :style="{
              left: block.x + 'px',
              top: block.y + 'px',
              transform: 'rotate(' + block.r + 'deg)'
            }"
          >
            <div v-for="(row, index) in block.rooms" class="block-row">
              <div
                v-for="room in wingRooms[block.id][index]"
                @click="show(room.name)"
                :class="[
                  { selected: isHighlighted === room.id },
                  room.class === 'store' ? 'map-background' : 'sub-map-item'
                ]"
                :style="{
                  width: room.width + 'px',
                  height: room.height + 'px',
                  margin:
                    room.m[0] +
                    'px ' +
                    room.m[1] +
                    'px ' +
                    room.m[2] +
                    'px ' +
                    room.m[3] +
                    'px'
                }"
              >
                {{ room.class === "store" ? "" : room.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-bar">
        <input
          v-model="search"
          type="text"
          autocomplete="off"
          placeholder="Search for a room"
          @keydown.down.prevent="moveHighlight(1)"
          @keydown.up.prevent="moveHighlight(-1)"
          @keydown.enter="activateItem"
        />
        <div v-if="search" class="search-box" ref="searchBox">
          <div
            v-for="(room, index) in searchedRooms"
            :key="room.name"
            :id="'room-' + index"
            @click="show(room.name), (search = '')"
            :class="{ highlighted: index === highlightedIndex }"
            class="search-item"
          >
            {{ room.name }}
          </div>
        </div>
        <div v-else-if="isRoomVisible">
          <div class="class-details">
            <p style="width: 100%" class="medium">Class details for</p>
            <icons
              icon="close"
              class="close"
              @click=";(highlightedItem = -1), (roomVisible = {})"
            ></icons>
          </div>
          <p class="title-menu">{{ roomVisible.name }}</p>
          <p>{{ roomVisible.description }}</p>
        </div>
        <div v-else style="height: calc(100% - 80px)">
          <p class="title-menu">Interactive Map</p>
          <div v-if="data.events.length" style="height: calc(100% - 76px)">
            <div class="spacer"></div>
            <p class="title-sub">Upcoming events</p>
            <div class="event-box">
              <div
                v-for="(event, index) in data.events"
                :key="event"
                :id="'event-' + index"
              >
                <div class="spacer"></div>
                <p class="medium">{{ event.title }}</p>
                <p>{{ event.description }}</p>
                <div class="rooms">
                  <div
                    v-for="room in event.roomIDs"
                    :key="room"
                    class="button"
                    @click="show(data.rooms[room].name)"
                  >
                    {{ data.rooms[room].name }}
                  </div>
                </div>
                <div class="event">
                  <p>{{ displayTime(event.start, false) }}</p>
                  <p>{{ displayTime(event.end, true) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Icons from "@/components/Icons.vue"
import data from "../assets/data.json"
import { computed, nextTick, onUnmounted, ref, watch } from "vue"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRoute } from "vue-router"

const route = useRoute()
dayjs.extend(relativeTime)

const roomVisible = ref({})
const search = ref("")
const highlightedIndex = ref(0)
const highlightedItem = ref(-1)
let searchedRooms = {}

const standardRooms = data.rooms.filter((item) => item.id in data.standard)
let wingRooms = []
for (let i = 0; i < data.blocks.length; i++) {
  wingRooms[i] = data.blocks[i].rooms.map((roomIDs) => {
    return roomIDs.map((roomId) => {
      return data.rooms.find((room) => room.id === roomId)
    })
  })
}

const show = (roomName) => {
  roomVisible.value = data.rooms.find((room) => room.name === roomName)
  highlightedItem.value = roomVisible.value.id
  search.value = ""
}
const searchRooms = () => {
  const lastSearchedRooms = searchedRooms
  searchedRooms = data.rooms.filter((room) => {
    if (search.value.length > 1) {
      return (
        room.name.toLowerCase().includes(search.value.toLowerCase()) ||
        room.description.toLowerCase().includes(search.value.toLowerCase())
      )
    } else {
      return room.name.toLowerCase().includes(search.value.toLowerCase())
    }
  })
  searchedRooms.sort((a, b) => {
    const aStartsWithSearch = a.name
      .toLowerCase()
      .startsWith(search.value.toLowerCase())
    const bStartsWithSearch = b.name
      .toLowerCase()
      .startsWith(search.value.toLowerCase())
    if (aStartsWithSearch && !bStartsWithSearch) {
      return -1
    } else if (!aStartsWithSearch && bStartsWithSearch) {
      return 1
    }
    return 0
  })
  if (JSON.stringify(lastSearchedRooms) !== JSON.stringify(searchedRooms)) {
    highlightedIndex.value = 0
  }
  if (searchedRooms.length && search.value) {
    highlightedItem.value = searchedRooms[highlightedIndex.value].id
  } else if (!searchedRooms.length) {
    highlightedItem.value = -1
  }
}
const moveHighlight = (step) => {
  if (Object.keys(searchedRooms).length === 0 || !search.value) return

  if (highlightedIndex.value === -1 && step === -1) {
    highlightedIndex.value = searchedRooms.length - 1
  } else if (
    highlightedIndex.value === searchedRooms.length - 1 &&
    step === 1
  ) {
    highlightedIndex.value = 0
  } else {
    highlightedIndex.value =
      (highlightedIndex.value + step + searchedRooms.length) %
      searchedRooms.length
  }
  if (searchedRooms.length) {
    highlightedItem.value = searchedRooms[highlightedIndex.value].id
  } else {
    highlightedItem.value = -1
  }
  nextTick(() => {
    const highlightedElement = document.getElementById("highlighted")
    if (highlightedElement) {
      highlightedElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      })
    }
  })
}
const activateItem = () => {
  if (highlightedIndex.value !== -1 && searchedRooms.length) {
    show(searchedRooms[highlightedIndex.value].name)
    search.value = ""
  }
}
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
const escPressed = (event) => {
  if (event.key === "Escape") {
    if (search.value) {
      search.value = ""
    } else if (roomVisible.value) {
      roomVisible.value = {}
    }
  }
}

const isRoomVisible = computed(() => {
  return Object.keys(roomVisible.value).length !== 0
})
const isHighlighted = computed(() => {
  if (search.value || isRoomVisible.value) {
    return highlightedItem.value
  }
})

watch(search, () => {
  searchRooms()
})

if (route.query.id) {
  show(data.rooms[route.query.id].name)
}
document.addEventListener("keydown", escPressed)

onUnmounted(() => {
  document.removeEventListener("keydown", escPressed)
})
</script>
