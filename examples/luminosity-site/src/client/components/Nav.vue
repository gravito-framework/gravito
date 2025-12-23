<script setup lang="ts">
import Logo from './Logo.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { usePage, Link } from '@inertiajs/vue3'
import { Globe, ChevronDown } from 'lucide-vue-next'

const isScrolled = ref(false)
const showLangMenu = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}
// ... existing scroll logic ...
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const page = usePage()
const locale = computed(() => page.props.locale || 'en')

const getPath = (path: string) => {
  if (path.startsWith('http')) return path
  if (locale.value === 'zh') return `/zh${path}`
  return path
}

const navLinks = [
  { label: 'Features', path: '/features' },
  { label: 'Documentation', path: '/docs' },
  { label: 'Frameworks', path: '/docs/frameworks' },
  { label: 'Gravito Framework', path: 'https://gravito.dev/en/docs/guide/seo-engine' },
  { label: 'GitHub', path: 'https://github.com/gravito-framework/gravito/tree/main/packages/luminosity' },
]

// ... existing switchLang logic ...
const toggleLang = () => {
  showLangMenu.value = !showLangMenu.value
}

const switchLang = (lang: string) => {
  const currentPath = window.location.pathname
  let newPath = currentPath
  
  if (lang === 'zh' && !currentPath.startsWith('/zh')) {
    newPath = `/zh${currentPath === '/' ? '' : currentPath}`
  } else if (lang === 'en' && currentPath.startsWith('/zh')) {
    newPath = currentPath.replace('/zh', '') || '/'
  }
  
  window.location.href = newPath
}
</script>

<template>
  <header 
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-6"
    :class="{ 'py-4 backdrop-blur-xl bg-void/80 border-b border-white/5 shadow-2xl shadow-singularity/5': isScrolled }"
  >
    <div class="max-w-7xl mx-auto px-6 flex items-center justify-between">
      <Link :href="getPath('/')">
        <Logo size="sm" />
      </Link>
      
      <nav class="hidden md:flex items-center gap-2 p-1.5 backdrop-blur-md bg-white/5 rounded-2xl border border-white/5">
        <template v-for="link in navLinks" :key="link.path">
            <a 
              v-if="link.path.startsWith('http')"
              :href="link.path"
              target="_blank"
              class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-singularity hover:bg-white/5 rounded-xl transition-all"
            >
              {{ link.label }}
            </a>
            <Link 
              v-else
              :href="getPath(link.path)"
              class="px-4 py-2 text-sm font-medium text-gray-400 hover:text-singularity hover:bg-white/5 rounded-xl transition-all"
            >
              {{ link.label }}
            </Link>
        </template>
      </nav>
      
      <div class="flex items-center gap-4">
        <!-- Language Switcher -->
        <div class="relative">
          <button 
            @click="toggleLang"
            class="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
          >
            <Globe :size="18" />
            <span class="text-xs font-bold uppercase">{{ locale }}</span>
            <ChevronDown :size="14" />
          </button>
          
          <div 
            v-if="showLangMenu" 
            class="absolute top-full right-0 mt-2 w-32 bg-panel border border-white/10 rounded-xl shadow-xl overflow-hidden backdrop-blur-xl flex flex-col z-50"
            @mouseleave="showLangMenu = false"
          >
            <button @click="switchLang('en')" class="px-4 py-3 text-left hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors">English</button>
            <button @click="switchLang('zh')" class="px-4 py-3 text-left hover:bg-white/5 text-sm text-gray-300 hover:text-white transition-colors">繁體中文</button>
          </div>
        </div>

        <a 
          href="https://github.com/gravito-framework/gravito" 
          class="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-singularity text-void text-sm font-bold rounded-xl hover:scale-105 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
        >
          Get Started
        </a>
      </div>
    </div>
  </header>
</template>
