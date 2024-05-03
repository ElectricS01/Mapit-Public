<template>
  <div class="container-flex">
    <div class="map-container">
      <div class="map-page">
        <div class="map">
          <div
            v-for="room in standardRooms"
            :key="room.id"
            :class="[
              { selected: isHighlighted === room.id },
              room.type === 'background' ? 'map-background' : 'map-item'
            ]"
            :style="{
              width: room.width + 'px',
              height: room.height + 'px',
              left: room.x + 'px',
              top: room.y + 'px',
              transform: 'rotate(' + room.r + 'deg)'
            }"
            @click="show(room.name)"
          >
            {{ room.type === "background" ? "" : room.name }}
          </div>
          <div
            v-for="block in data.blocks"
            :id="'block-' + block.id"
            :key="block.id"
            class="block"
            :class="{ selected: isHighlighted === block.roomId && !block.type }"
            :style="{
              left: block.x + 'px',
              top: block.y + 'px',
              transform: 'rotate(' + block.r + 'deg)',
              border: '1px solid #' + block.c
            }"
          >
            <div
              class="block-title"
              :style="{
                bottom: block.tWidth
                  ? blockHeights[block.id] / 2 + 'px'
                  : blockHeights[block.id] + 'px',
                width: block.tWidth + 'px',
                right: block.tWidth ? 0 : ''
              }"
              @click="show(block.name)"
            >
              {{ block.name }}
            </div>
            <div
              v-for="(row, index) in block.rooms"
              :key="row"
              class="block-row"
              :style="{ height: block?.o && index === 0 ? block.o + 'px' : '' }"
            >
              <div
                v-for="room in wingRooms[block.id][index]"
                :key="room"
                :class="[
                  { selected: isHighlighted === room.id },
                  room.type === 'background' || room.type === 'hidden'
                    ? 'sub-map-background'
                    : 'sub-map-item'
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
                @click="show(room.name)"
              >
                {{
                  room.type === "background" || room.type === "hidden"
                    ? ""
                    : room.name
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-bar">
        <div class="class-details">
          <input
            v-model="search"
            style="width: calc(100% - 40px)"
            autocomplete="off"
            placeholder="Search for a room"
            @keydown.down.prevent="moveHighlight(1)"
            @keydown.up.prevent="moveHighlight(-1)"
            @keydown.enter="activateItem"
          />
          <icons icon="settings" class="edit" @click="showEdit = !showEdit" />
        </div>
        <div v-if="search" ref="searchBox" class="search-box">
          <div
            v-for="(room, index) in searchedRooms"
            :id="'room-' + index"
            :key="room.name"
            :class="{ highlighted: index === highlightedIndex }"
            class="search-item"
            @click="show(room.name), (search = '')"
          >
            {{ room.name }}
          </div>
        </div>
        <div v-else-if="isRoomVisible">
          <div class="class-details">
            <p style="width: 100%" class="medium">Room details for</p>
            <icons
              icon="close"
              class="close"
              @click=";(highlightedItem = -1), (roomVisible = {})"
            />
          </div>
          <p class="title-menu">
            {{ roomVisible.name }}
          </p>
          <p>{{ roomVisible.description }}</p>
        </div>
        <div v-else-if="showEdit" class="edit-panel">
          <div
            class="edit-panel-list"
            :style="{ height: highlightedEdit === -1 ? '100%' : '50%' }"
          >
            <div
              v-for="room in standardRooms"
              :key="room.id"
              :class="{ highlighted: room.id === highlightedEdit }"
              class="search-item edit-panel-sub"
              @click="editRoom(room.id)"
            >
              {{ room.name }}
            </div>
            <div v-for="block in data.blocks" :key="block.id">
              <div
                :class="{ highlighted: block.roomId === highlightedEdit }"
                class="search-item"
                @click="editRoom(block.roomId)"
              >
                {{ block.name || "Unnamed Block" }}
              </div>
              <div
                v-for="(row, index) in block.rooms"
                :key="row"
                class="edit-panel-sub"
              >
                <div
                  :class="{ highlighted: block.roomId === highlightedEdit }"
                  class="search-item"
                  @click="editRoom(block.roomId)"
                >
                  Row {{ index }}
                </div>
                <div
                  v-for="room in wingRooms[block.id][index]"
                  :key="room.id"
                  :class="{ highlighted: room.id === highlightedEdit }"
                  class="search-item edit-panel-sub"
                  @click="editRoom(room.id)"
                >
                  {{ room.name }}
                </div>
              </div>
            </div>
          </div>
          <div v-if="highlightedEdit !== -1" class="edit-panel-edit">
            <div class="spacer" />
            <p class="title-menu" style="margin: 0">
              {{
                rooms.find(
                  (e) =>
                    e.id === highlightedEdit || e.roomId === highlightedEdit
                )?.name
              }}
            </p>
            <p>
              {{
                rooms.find(
                  (e) =>
                    e.id === highlightedEdit || e.roomId === highlightedEdit
                )?.description
              }}
            </p>
          </div>
        </div>
        <div v-else style="height: calc(100% - 80px)">
          <p class="title-menu">Interactive Map</p>
          <div v-if="data.events.length" style="height: calc(100% - 76px)">
            <div class="spacer" />
            <p class="title-sub">Upcoming events</p>
            <div class="event-box">
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
                  <div
                    v-for="room in event.roomIDs"
                    :key="room"
                    class="button"
                    @click="showById(room)"
                  >
                    {{
                      rooms.find((e) => e.id === room || e.roomId === room)
                        ?.name
                    }}
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
import Icons from "../components/Icons.vue"
import data from "../assets/data.json"
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRoute } from "vue-router"

const route = useRoute()
dayjs.extend(relativeTime)

const roomVisible = ref({})
const showEdit = ref(false)
const search = ref("")
const highlightedIndex = ref(0)
const highlightedItem = ref(-1)
const highlightedEdit = ref(-1)
let searchedRooms = {}
const blockHeights = ref([])

const standardRooms = data.standard
const rooms = data.standard
  .concat(data.rooms)
  .concat(data.blocks)
  .filter((value) => Object.keys(value).length !== 0 && value.name)
// const width =
//   Math.max(
//     ...rooms.map((obj) => {
//       return obj.x + obj.width || obj.x || obj.width || null
//     })
//   ) + 22
// const height =
//   Math.max(
//     ...rooms.map((room) => {
//       return room.y + room.height || room.y || room.height || null
//     })
//   ) + 22
// console.log(width)
// console.log(height)
let wingRooms = []
for (let i = 0; i < data.blocks.length; i++) {
  wingRooms[i] = data.blocks[i].rooms.map((roomIDs) => {
    return roomIDs.map((roomId) => {
      return data.rooms.find((room) => room.id === roomId)
    })
  })
}

const showById = (id) => {
  show(rooms.find((e) => e.id === id || e.roomId === id)?.name)
}
const show = (roomName) => {
  roomVisible.value = rooms.find((room) => room.name === roomName)
  highlightedItem.value = roomVisible.value.roomId || roomVisible.value.id
  search.value = ""
}
const editRoom = (roomId) => {
  highlightedEdit.value = roomId
}
const searchRooms = () => {
  const lastSearchedRooms = searchedRooms
  searchedRooms = rooms.filter((room) => {
    if (room.type !== "hidden") {
      if (search.value.length > 1) {
        return (
          room.name.toLowerCase().includes(search.value.toLowerCase()) ||
          room.description?.toLowerCase().includes(search.value.toLowerCase())
        )
      } else {
        return room.name.toLowerCase().includes(search.value.toLowerCase())
      }
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
    highlightedItem.value =
      searchedRooms[highlightedIndex.value].roomId ||
      searchedRooms[highlightedIndex.value].id
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
    highlightedItem.value =
      searchedRooms[highlightedIndex.value].roomId ||
      searchedRooms[highlightedIndex.value].id
  } else {
    highlightedItem.value = -1
  }
  nextTick(() => {
    const highlightedElement = document.getElementsByClassName("highlighted")
    if (highlightedElement) {
      highlightedElement[0].scrollIntoView({
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
  } else return -1
})
watch(search, () => {
  searchRooms()
})

if (route.query.id) {
  show(route.query.id)
}
document.addEventListener("keydown", escPressed)

onMounted(() => {
  nextTick(() => {
    for (const block in data.blocks) {
      blockHeights.value.push(
        document.getElementById("block-" + block)?.clientHeight + 4
      )
    }
  })
})
onUnmounted(() => {
  document.removeEventListener("keydown", escPressed)
})
</script>
