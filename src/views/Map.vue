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
            :class="{ selected: isHighlighted(0) }"
            style="
              width: 110px;
              height: 130px;
              line-height: 130px;
              top: 20px;
              left: 20px;
            "
          >
            {{ rooms[0].name }}
          </div>
          <div
            class="block"
            style="
              top: 300px;
              left: 190px;
              transform: rotate(30deg);
            "
          >
            <div style="display: flex">
              <div
                @click="show('Room 2')"
                class="sub-map-item"
                :class="{ selected: isHighlighted(1) }"
                style="width: 100px; height: 100px; line-height: 30px"
              >
                {{ rooms[1].name }}
              </div>
              <div
                @click="show('Room 3')"
                class="sub-map-item"
                :class="{ selected: isHighlighted(2) }"
                style="
                  width: 60px;
                  height: 60px;
                  line-height: 30px;
                  margin-left: 4px;
                "
              >
                {{ rooms[2].name }}
              </div>
            </div>
            <div style="display: flex; margin-top: 4px">
              <div
                @click="show('Room 4')"
                class="map-background"
                :class="{ selected: isHighlighted(3) }"
                style="width: 36px; height: 32px; margin-left: 54px"
              ></div>
            </div>
            <div style="display: flex; margin-top: 4px">
              <div
                @click="show('Room 5')"
                class="map-background"
                :class="{ selected: isHighlighted(4) }"
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
        <div v-else-if="isRoomVisible()">
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
          <div v-if="events.length" style="height: calc(100% - 76px)">
            <div class="spacer"></div>
            <p class="title-sub">Upcoming events</p>
            <div class="event-box">
              <div
                v-for="(event, index) in events"
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
                    @click="show(rooms[room].name)"
                  >
                    {{ rooms[room].name }}
                  </div>
                </div>
                <div class="event">
                  <p>{{ displayTime(event.start) }}</p>
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
<script>
import Icons from "@/components/Icons.vue"
import data from "../assets/data.json"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

export default {
  components: { Icons },
  data() {
    return {
      roomVisible: {},
      search: "",
      searchedRooms: {},
      highlightedIndex: 0,
      highlightedItem: -1
    }
  },
  methods: {
    show(roomName) {
      this.roomVisible = this.rooms.find((room) => room.name === roomName)
      this.highlightedItem = this.roomVisible.id
      this.search = ""
    },
    isRoomVisible() {
      return Object.keys(this.roomVisible).length !== 0
    },
    searchRooms() {
      const lastSearchedRooms = this.searchedRooms
      this.searchedRooms = this.rooms.filter((room) => {
        if (this.search.length > 1) {
          return (
            room.name.toLowerCase().includes(this.search.toLowerCase()) ||
            room.description.toLowerCase().includes(this.search.toLowerCase())
          )
        } else {
          return room.name.toLowerCase().includes(this.search.toLowerCase())
        }
      })
      this.searchedRooms.sort((a, b) => {
        const aStartsWithSearch = a.name
          .toLowerCase()
          .startsWith(this.search.toLowerCase())
        const bStartsWithSearch = b.name
          .toLowerCase()
          .startsWith(this.search.toLowerCase())
        if (aStartsWithSearch && !bStartsWithSearch) {
          return -1
        } else if (!aStartsWithSearch && bStartsWithSearch) {
          return 1
        }
        return 0
      })
      if (
        JSON.stringify(lastSearchedRooms) !== JSON.stringify(this.searchedRooms)
      ) {
        this.highlightedIndex = 0
      }
      if (this.searchedRooms.length && this.search) {
        this.highlightedItem = this.searchedRooms[this.highlightedIndex].id
      } else if (!this.searchedRooms.length) {
        this.highlightedItem = -1
      }
    },
    moveHighlight(step) {
      if (Object.keys(this.searchedRooms).length === 0 || !this.search) return

      if (this.highlightedIndex === -1 && step === -1) {
        this.highlightedIndex = this.searchedRooms.length - 1
      } else if (
        this.highlightedIndex === this.searchedRooms.length - 1 &&
        step === 1
      ) {
        this.highlightedIndex = 0
      } else {
        this.highlightedIndex =
          (this.highlightedIndex + step + this.searchedRooms.length) %
          this.searchedRooms.length
      }
      if (this.searchedRooms.length) {
        this.highlightedItem = this.searchedRooms[this.highlightedIndex].id
      } else {
        this.highlightedItem = -1
      }
      this.$nextTick(() => {
        const highlightedElement =
          this.$refs.searchBox.querySelector(".highlighted")
        if (highlightedElement) {
          highlightedElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "nearest"
          })
        }
      })
    },
    activateItem() {
      if (this.highlightedIndex !== -1 && this.searchedRooms.length) {
        this.show(this.searchedRooms[this.highlightedIndex].name)
        this.search = ""
      }
    },
    isHighlighted(id) {
      return (
        !!(this.search && this.highlightedItem === id) ||
        (this.isRoomVisible() && this.highlightedItem === id)
      )
    },
    escPressed(event) {
      if (event.key === "Escape") {
        if (this.search) {
          this.search = ""
        } else if (this.roomVisible) {
          this.roomVisible = {}
        } else if (this.editing) {
          this.editing = false
        } else if (this.replyTo) {
          this.replyTo = null
        } else if (!this.profileShown) {
          this.scroll(true)
        }
      }
    },
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
    rooms() {
      return data.rooms
    },
    events() {
      return data.events
    }
  },
  mounted() {
    if (this.$route.query.id) {
      this.show(this.rooms[this.$route.query.id].name)
    }
    document.addEventListener("keydown", this.escPressed)
  },
  beforeRouteLeave() {
    document.removeEventListener("keydown", this.escPressed)
  },
  unmounted() {
    document.removeEventListener("keydown", this.escPressed)
  },
  watch: {
    search: {
      handler: "searchRooms",
      deep: true
    }
  }
}
</script>
