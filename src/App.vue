<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { store } from './common/store'
import MoneyBackground from './components/common/MoneyBackground.vue';

const router = useRouter()

const loading = ref(true);
const preventCollapse = function (event) {
  if (window.scrollY === 0) {
    window.scrollTo(0, 1);
  }
}

onMounted(async () => {
  await store.init()
  loading.value = false;
  router.push('/home');
})
</script>

<template>
  <MoneyBackground />

  <div class="relative z-10">
    <div class="flex flex-col h-[100vh]">
      <div id="content" class="flex-1 overflow-auto p-4" v-on:touchstart="preventCollapse(event)">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>