import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg', '**/*.m4a', '**/*.flac'], base: './', server: { watch: { usePolling: true, interval: 300 } } });
