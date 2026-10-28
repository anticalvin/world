import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  // Browser specs share one Colyseus lounge server. Parallel specs introduce
  // extra human clients and invalidate exact multiplayer presence assertions.
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: [
    {
      command: "npm --prefix server start",
      url: "http://127.0.0.1:2567/health",
      reuseExistingServer: true,
    },
    {
      command:
        "VITE_AWAKEN_WS_URL=ws://127.0.0.1:2567 npm run dev -- --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: true,
    },
  ],
});
