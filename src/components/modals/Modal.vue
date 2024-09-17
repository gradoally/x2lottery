<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  confirmButtonEnabled: {
    type: Boolean,
    default: true,
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm'
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel'
  },
  hideTitle: {
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['close', 'confirm']);

const close = () => {
  emit('close');
};

const confirm = () => {
  emit('confirm');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="p-8 rounded-lg bg-zinc-800 shadow-lg w-[90%]">
      <header class="flex justify-center items-center mb-4" v-if="!hideTitle">
        <h2 class="text-xl font-semibold uppercase">{{ title }}</h2>
      </header>
      <div class="mb-10">
        <slot></slot>
      </div>
      <footer class="flex flex-col justify-center">
        <button v-if="confirmButtonEnabled" @click="confirm"
          class="text-white bg-blue-800 px-5 py-2 rounded-md hover:bg-blue-950">{{ confirmButtonText }}</button>
        <button @click="close"
          class="text-white mt-2 px-5 py-2 rounded-md hover:bg-gray-800" :class="{'bg-red-800': !confirmButtonEnabled, 'bg-gray-500': confirmButtonEnabled}">{{ cancelButtonText }}</button>
      </footer>
    </div>
  </div>
</template>