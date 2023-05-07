import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
  process.env = {...process.env, ...loadEnv(mode, process.cwd())};
  console.log(mode)


  return defineConfig({
    base: mode === "development" ? "/" : "/BYODMCSE/",
    plugins: [react()],
  });
}