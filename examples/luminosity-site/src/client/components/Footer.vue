<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import Logo from './Logo.vue'
import { useI18n } from '../composables/useI18n'

const { locale } = useI18n()

const getPath = (path: string) => {
  if (locale.value === 'zh') return `/zh${path}`
  return path
}
</script>

<template>
  <footer class="bg-[#050505] border-t border-white/5 pt-24 pb-12">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div class="col-span-1 md:col-span-2">
          <Logo size="md" class="mb-6" />
          <p class="text-gray-500 max-w-sm mb-8">
            The intelligent core of the Gravito SmartMap Engine™. 
            High-performance sitemap generation and SEO management for enterprise-scale applications.
          </p>
        </div>
        
        <div>
          <h4 class="font-bold mb-6 text-sm uppercase tracking-widest text-emerald-500">Resources</h4>
          <ul class="space-y-4">
            <li>
              <Link :href="getPath('/docs/introduction')" class="text-gray-400 hover:text-white transition-colors">
                Documentation
              </Link>
            </li>
            <li>
              <Link :href="getPath('/docs/benchmark')" class="text-gray-400 hover:text-white transition-colors">
                Benchmark Report
              </Link>
            </li>
            <li>
              <a href="https://github.com/gravito-framework/gravito/tree/main/examples" target="_blank" class="text-gray-400 hover:text-white transition-colors">
                Examples
              </a>
            </li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-bold mb-6 text-sm uppercase tracking-widest text-emerald-500">Community</h4>
          <ul class="space-y-4">
            <li><a href="https://github.com/gravito-framework/gravito" class="text-gray-400 hover:text-white transition-colors">GitHub</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Discord</a></li>
            <li><a href="#" class="text-gray-400 hover:text-white transition-colors">Twitter</a></li>
          </ul>
        </div>
      </div>
      
      <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p class="text-gray-600 text-sm">
          &copy; {{ new Date().getFullYear() }} Gravito Framework. Built for Builders.
        </p>
        <div class="flex gap-6">
          <a href="#" class="text-gray-600 hover:text-white text-sm">Privacy</a>
          <a href="#" class="text-gray-600 hover:text-white text-sm">Terms</a>
        </div>
      </div>
    </div>
  </footer>
</template>
