import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  console.log(mode)


  return defineConfig({
    // base: mode === "development" ? "/" : "/BYODMCSE/",
    plugins: [react(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ["**/*"],
        },
        // add this to cache all the
        // static assets in the public folder
        includeAssets: ["**/*"],
        manifest: {
          name: "BYODMCSE",
          short_name: "BYODMCSE",
          description: "bring your own device multi channel sound experience",
          theme_color: "#ffffff",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            // {
            //   src: "pwa-maskable-192x192.png",
            //   sizes: "192x192",
            //   type: "image/png",
            //   purpose: "maskable",
            // },
            // {
            //   src: "pwa-maskable-512x512.png",
            //   sizes: "512x512",
            //   type: "image/png",
            //   purpose: "maskable",
            // },
          ],
        },
      }),
    ],
  });
}
