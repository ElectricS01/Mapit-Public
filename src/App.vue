<template>
  <header :class="isDarkMode === 'true' ? 'dark-mode' : 'light-mode'">
    <div class="navbar" id="mobile-navbar">
      <router-link to="/" @click="responsive_navbar()">Home</router-link>
      <router-link
        to="/map"
        :class="{ active: active('/map') }"
        @click="responsive_navbar()"
      >
        Map
      </router-link>
      <router-link
        to="/events"
        :class="{ active: active('/events') }"
        @click="responsive_navbar()"
      >
        Events
      </router-link>
      <router-link
        to="/about"
        :class="{ active: active('/about') }"
        @click="responsive_navbar()"
      >
        About
      </router-link>
      <icons
        :icon="isDarkMode === 'true' ? 'sun' : 'moon'"
        class="mode-switch"
        @click="toggleMode()"
      ></icons>
      <div class="icon-mobile" @click="responsive_navbar()">☰</div>
    </div>
  </header>
  <main :class="isDarkMode === 'true' ? 'dark-mode' : 'light-mode'">
    <div class="background-container">
      <div class="background"></div>
      <router-view />
    </div>
  </main>
</template>

<script>
import Icons from "@/components/Icons.vue"

export default {
  name: "App",
  components: { Icons },
  data() {
    return {
      isDarkMode: "true"
    }
  },
  methods: {
    active(route) {
      return route === this.$route.path
    },
    responsive_navbar() {
      const responsive_navbar = document.getElementById("mobile-navbar")
      if (responsive_navbar.className === "navbar") {
        responsive_navbar.className += " responsive"
      } else {
        responsive_navbar.className = "navbar"
      }
    },
    toggleMode() {
      if (localStorage.getItem("isDarkMode") !== "true") {
        localStorage.setItem("isDarkMode", "true")
        document.body.style.backgroundColor = "#181a1b"
      } else {
        localStorage.setItem("isDarkMode", "false")
        document.body.style.backgroundColor = "white"
      }
      this.isDarkMode = localStorage.getItem("isDarkMode")
    }
  },
  created() {
    if (localStorage.getItem("isDarkMode")) {
      this.isDarkMode = localStorage.getItem("isDarkMode")
    } else {
      localStorage.setItem("isDarkMode", "true")
      this.isDarkMode = "true"
    }
    if (localStorage.getItem("isDarkMode") !== "true") {
      document.body.style.backgroundColor = "white"
    }
  }
}
</script>
