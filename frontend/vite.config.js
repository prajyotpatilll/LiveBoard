import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    cors: {
      origin: "http://localhost:3001", // allow backend server to connect (Socket.IO polling fallback)
      methods: ["GET", "POST"]
    }
  }
});
