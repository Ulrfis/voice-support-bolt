// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import fs from "fs";
import path from "path";
var __vite_injected_original_dirname = "/home/project";
function safePublicCopy() {
  return {
    name: "safe-public-copy",
    apply: "build",
    closeBundle() {
      const publicDir = path.resolve(__vite_injected_original_dirname, "public");
      const distDir = path.resolve(__vite_injected_original_dirname, "dist");
      if (!fs.existsSync(publicDir)) return;
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        const src = path.join(publicDir, file);
        const dest = path.join(distDir, file);
        try {
          fs.accessSync(src, fs.constants.R_OK);
          fs.copyFileSync(src, dest);
        } catch {
          console.warn(`[safe-public-copy] Skipped unreadable file: ${file}`);
        }
      }
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), safePublicCopy()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    copyPublicDir: false
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmZ1bmN0aW9uIHNhZmVQdWJsaWNDb3B5KCk6IGltcG9ydCgndml0ZScpLlBsdWdpbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3NhZmUtcHVibGljLWNvcHknLFxuICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIGNsb3NlQnVuZGxlKCkge1xuICAgICAgY29uc3QgcHVibGljRGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3B1YmxpYycpO1xuICAgICAgY29uc3QgZGlzdERpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdkaXN0Jyk7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocHVibGljRGlyKSkgcmV0dXJuO1xuICAgICAgY29uc3QgZmlsZXMgPSBmcy5yZWFkZGlyU3luYyhwdWJsaWNEaXIpO1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgIGNvbnN0IHNyYyA9IHBhdGguam9pbihwdWJsaWNEaXIsIGZpbGUpO1xuICAgICAgICBjb25zdCBkZXN0ID0gcGF0aC5qb2luKGRpc3REaXIsIGZpbGUpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGZzLmFjY2Vzc1N5bmMoc3JjLCBmcy5jb25zdGFudHMuUl9PSyk7XG4gICAgICAgICAgZnMuY29weUZpbGVTeW5jKHNyYywgZGVzdCk7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgIGNvbnNvbGUud2FybihgW3NhZmUtcHVibGljLWNvcHldIFNraXBwZWQgdW5yZWFkYWJsZSBmaWxlOiAke2ZpbGV9YCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgc2FmZVB1YmxpY0NvcHkoKV0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgY29weVB1YmxpY0RpcjogZmFsc2UsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sUUFBUTtBQUNmLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQUt6QyxTQUFTLGlCQUF3QztBQUMvQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsSUFDUCxjQUFjO0FBQ1osWUFBTSxZQUFZLEtBQUssUUFBUSxrQ0FBVyxRQUFRO0FBQ2xELFlBQU0sVUFBVSxLQUFLLFFBQVEsa0NBQVcsTUFBTTtBQUM5QyxVQUFJLENBQUMsR0FBRyxXQUFXLFNBQVMsRUFBRztBQUMvQixZQUFNLFFBQVEsR0FBRyxZQUFZLFNBQVM7QUFDdEMsaUJBQVcsUUFBUSxPQUFPO0FBQ3hCLGNBQU0sTUFBTSxLQUFLLEtBQUssV0FBVyxJQUFJO0FBQ3JDLGNBQU0sT0FBTyxLQUFLLEtBQUssU0FBUyxJQUFJO0FBQ3BDLFlBQUk7QUFDRixhQUFHLFdBQVcsS0FBSyxHQUFHLFVBQVUsSUFBSTtBQUNwQyxhQUFHLGFBQWEsS0FBSyxJQUFJO0FBQUEsUUFDM0IsUUFBUTtBQUNOLGtCQUFRLEtBQUssK0NBQStDLElBQUksRUFBRTtBQUFBLFFBQ3BFO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLGVBQWUsQ0FBQztBQUFBLEVBQ25DLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxFQUNqQjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
