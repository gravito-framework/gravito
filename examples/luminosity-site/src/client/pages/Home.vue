<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import { Activity, Zap, HardDrive, FileText } from 'lucide-vue-next';
</script>

<template>
  <Head title="Luminosity - The Sitemap Engine" />
  
  <div class="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30">
    <!-- Hero Section -->
    <section class="relative h-screen flex items-center justify-center overflow-hidden">
      <!-- Background Grid -->
      <div class="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <!-- Content -->
      <div class="relative z-10 text-center px-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-mono tracking-widest uppercase mb-8">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          System Online
        </div>
        
        <h1 class="text-6xl md:text-8xl font-black tracking-tighter mb-6">
          MAPPING THE <br />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">INFINITE WEB</span>
        </h1>
        
        <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-light">
          The enterprise-grade sitemap engine for Gravito. <br />
          Stream millions of URLs without breaking a sweat.
        </p>
        
        <div class="flex gap-4 justify-center">
          <button class="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
            View Benchmark
          </button>
          <button class="px-8 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-colors">
            Documentation
          </button>
        </div>
      </div>
    </section>

    <!-- Benchmark Section -->
    <section class="py-24 bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-6">
        
        <!-- Section Header -->
        <div class="text-center mb-20">
          <h2 class="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            FIREPOWER <span class="text-green-500">UNLEASHED</span>
          </h2>
          <p class="text-gray-400">Tested on 1,000,000 URLs with SQLite source.</p>
        </div>

        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          <!-- Metric 1 -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-2 text-green-400">
              <FileText size="20" />
              <span class="text-xs font-mono uppercase tracking-wider">Total URLs</span>
            </div>
            <div class="text-4xl font-black text-white">1,000,000</div>
            <div class="text-sm text-gray-500 mt-1">Processed in one stream</div>
          </div>

          <!-- Metric 2 -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-2 text-blue-400">
              <Zap size="20" />
              <span class="text-xs font-mono uppercase tracking-wider">Throughput</span>
            </div>
            <div class="text-4xl font-black text-white">70k<span class="text-lg text-gray-500">/sec</span></div>
            <div class="text-sm text-gray-500 mt-1">Consistent velocity</div>
          </div>

          <!-- Metric 3 -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-2 text-amber-400">
              <HardDrive size="20" />
              <span class="text-xs font-mono uppercase tracking-wider">Memory Peak</span>
            </div>
            <div class="text-4xl font-black text-white">84<span class="text-lg text-gray-500">MB</span></div>
            <div class="text-sm text-gray-500 mt-1">Zero OOM crashes</div>
          </div>

          <!-- Metric 4 -->
          <div class="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <div class="flex items-center gap-3 mb-2 text-purple-400">
              <Activity size="20" />
              <span class="text-xs font-mono uppercase tracking-wider">Time</span>
            </div>
            <div class="text-4xl font-black text-white">14.2<span class="text-lg text-gray-500">s</span></div>
            <div class="text-sm text-gray-500 mt-1">From seed to XML</div>
          </div>
        </div>

        <!-- Terminal Demo -->
        <div class="max-w-4xl mx-auto">
          <div class="rounded-xl overflow-hidden border border-white/10 bg-[#0F0F0F] shadow-2xl">
            <!-- Terminal Header -->
            <div class="bg-[#1A1A1A] px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div class="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
              <div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              <div class="ml-4 text-xs font-mono text-gray-500">luminosity-benchmark — bun run benchmark</div>
            </div>
            
            <!-- Terminal Body -->
            <div class="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
              <div class="text-gray-400">$ bun run benchmark</div>
              <div class="text-white mt-2">🌌 Luminosity Benchmark: Starting Sitemap Generation...</div>
              <div class="text-gray-600">--------------------------------------------------</div>
              <div class="text-gray-300 mt-2">🚀 Processed: 100,000 | Mem: 42 MB</div>
              <div class="text-gray-300">🚀 Processed: 500,000 | Mem: 65 MB</div>
              <div class="text-gray-300">🚀 Processed: 900,000 | Mem: 82 MB</div>
              <div class="text-gray-300">🚀 Processed: 1,000,000 | Mem: 84 MB</div>
              
              <div class="mt-6 border border-white/10 p-4 rounded bg-white/5">
                <div class="text-green-400 font-bold mb-2">GRAVITO LUMINOSITY - FIREPOWER REPORT</div>
                <div class="grid grid-cols-2 gap-x-8 gap-y-1 text-gray-300">
                  <div>🌌 Total URLs</div><div class="text-right">1,000,000</div>
                  <div>⏱️ Time Elapsed</div><div class="text-right">14.20s</div>
                  <div>🧠 Max Memory</div><div class="text-right text-amber-400">84 MB</div>
                  <div>📂 Files Generated</div><div class="text-right">20</div>
                  <div>🚀 Throughput</div><div class="text-right">70,422 URLs/sec</div>
                </div>
              </div>
              
              <div class="text-green-500 mt-4">✅ Sitemaps generated in: /app/dist-sitemaps</div>
              <div class="text-gray-400 mt-2 flex gap-2">
                <span>$</span>
                <span class="w-2 h-5 bg-gray-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  </div>
</template>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>