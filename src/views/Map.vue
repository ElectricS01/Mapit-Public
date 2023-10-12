<template>
  <div class="container-flex">
    <div class="map-container">
      <div class="map-page">
        <p
          style="
            position: fixed;
            top: 52px;
            left: 4px;
            color: red;
            z-index: 6;
            font-size: 24px;
            margin: 0;
          "
        >
          PROTOTYPE
        </p>
        <div class="map">
          <div
            @click="show('Room 1')"
            class="map-item"
            :class="{ selected: isHighlighted === 0 }"
            style="
              width: 110px;
              height: 130px;
              line-height: 130px;
              top: 20px;
              left: 20px;
            "
          >
            {{ data.rooms[0].name }}
          </div>
          <div
            class="block"
            style="top: 300px; left: 190px; transform: rotate(30deg)"
          >
            <div style="display: flex">
              <div
                @click="show('Room 2')"
                class="sub-map-item"
                :class="{ selected: isHighlighted === 1 }"
                style="width: 100px; height: 100px; line-height: 30px"
              >
                {{ data.rooms[1].name }}
              </div>
              <div
                @click="show('Room 3')"
                class="sub-map-item"
                :class="{ selected: isHighlighted === 2 }"
                style="
                  width: 60px;
                  height: 60px;
                  line-height: 30px;
                  margin-left: 4px;
                "
              >
                {{ data.rooms[2].name }}
              </div>
            </div>
            <div style="display: flex; margin-top: 4px">
              <div
                @click="show('Room 4')"
                class="map-background"
                :class="{ selected: isHighlighted === 3 }"
                style="width: 36px; height: 32px; margin-left: 54px"
              ></div>
            </div>
            <div style="display: flex; margin-top: 4px">
              <div
                @click="show('Room 5')"
                class="map-background"
                :class="{ selected: isHighlighted === 4 }"
                style="width: 36px; height: 32px; margin-left: 54px"
              ></div>
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
          <div style="display: flex">
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
let searchedRooms = {}
const highlightedIndex = ref(0)
const highlightedItem = ref(-1)

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
