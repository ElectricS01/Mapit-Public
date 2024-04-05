import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: "Mapit",
        short_name: "Mapit",
        description:
          "Mapit is an interactive school map and map builder program to make navigation easier for everyone",
        theme_color: "#282a2b",
        background_color: "#181a1b",
        display: "fullscreen",
        categories: ["productivity", "events", "lifestyle", "utilities"],
        start_url: "/map"
      }
    })
  ],
  server: {
    port: 8080
  }
})
