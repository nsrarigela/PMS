import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Vite's config file: tells it to use the React plugin (JSX support)
// and sets up "@/..." as a shortcut for the src folder, so imports like
// `import { getProjects } from "@/lib/store"` work from any file depth.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
