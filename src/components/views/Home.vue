<script setup>
import { ref, computed, onMounted } from 'vue'
import { initHapticFeedback } from '@telegram-apps/sdk';
import { FaceSmileIcon } from '@heroicons/vue/24/solid';
import { HeadsOrTails } from '../../wrappers/HeadsOrTails';
import Modal from '../modals/Modal.vue';
import Button from '../common/Button.vue';
import { store } from '../../common/store';

const jettonSymbol = ref(import.meta.env.VITE_JETTON_SYMBOL);

const hapticFeedback = initHapticFeedback();

const amount = ref(1);

const modalOpen = ref(false);
const modalTitle = ref('');
const modalDescription = ref('');

const openModal = () => {
  modalOpen.value = true;
  modalTitle.value = "Modal title";
  modalDescription.value = "Modal description";
}

let isFlipping = false;
let currentDegrees = 0;

const playGame = async () => {
  if (isFlipping) return;

  const betResult = await store.telegram.playGame(amount.value);

  coin.classList.add("flipping");
  isFlipping = true;

  const random = Math.floor(Math.random() * 4 + parseInt(betResult));

  currentDegrees += 180 * random;

  coin.style.transform = `rotateY(${currentDegrees}deg)`;

  setTimeout(() => {
    isFlipping = false;
    coin.classList.remove("flipping");
  }, 5000);
}

onMounted(async () => {
  await store.telegram.initConnectWalletButton('ton-connect-button')
});
</script>

<template>
  <div class="text-center flex flex-col h-full">
    <div class="text-center text-3xl uppercase p-5">
      <button id="ton-connect-button" type="button"></button>
    </div>
    <div class="flex flex-col justify-center content-center">
      <div class="flex justify-center">
        <div id="coin">
          <div id="front"><img src="/icon.png" class="pulse w-[60vw]"></div>
          <div id="back"><img src="/loser.png" class="pulse w-[60vw]"></div>
        </div>
      </div>
      <div class="mt-6">
        <form class="max-w-xs mx-auto">
          <label for="quantity-input" class="block mb-2 text-sm font-medium text-white">Your bet:</label>
          <div class="flex justify-center">
            <div class="relative flex items-center max-w-[8rem]">
              <button type="button" @click="amount--"
                class="bg-blue-800 0 border-blue-900 rounded-s-lg p-3 h-11 focus:ring-blue-700 dark:focus:ring-blue-700 focus:ring-2 focus:outline-none">
                <svg class="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 18 2">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M1 1h16" />
                </svg>
              </button>
              <input type="number" v-model="amount" data-input-counter aria-describedby="helper-text-explanation"
                class="bg-blue-50 border-x-0 border-blue-300 h-11 text-center text-gray-900 font-bold text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 dark:bg-blue-700 dark:border-blue-600 dark:placeholder-blue-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="1" required />
              <button type="button" @click="amount++"
                class="bg-blue-800 0 border-blue-900 rounded-e-lg p-3 h-11 focus:ring-blue-700 dark:focus:ring-blue-700 focus:ring-2 focus:outline-none">
                <svg class="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 1v16M1 9h16" />
                </svg>
              </button>
            </div>
          </div>

          <p id="helper-text-explanation" class="mt-4 text-sm text-gray-400">Min: 1 TON</p>
          <p id="helper-text-explanation" class="text-sm text-gray-400">Max: 10 TON</p>
        </form>

        <div class="mt-5">
          <Button @click="playGame()" :disabled="!store.telegram.walletAccount">
            Bet
          </Button>
        </div>
        <div v-if="!store.telegram.walletAccount" class="mt-4 text-xs text-orange-500">
          Connect your TON wallet to play
        </div>
      </div>
    </div>
    <div class="flex justify-center">
      <!-- footer -->
    </div>
  </div>

  <Modal :isOpen="modalOpen" @close="modalOpen = false" :confirmButtonEnabled="false" :cancelButtonText="'Ok'"
    :title="modalTitle">
    <p class="text-center">
      {{ modalDescription }}
    </p>
  </Modal>
</template>

<style>
#coin {
  position: relative;
  width: 200px;
  height: 200px;
  perspective: 1000px;
  transition: transform 5s ease, box-shadow 0.2s ease;
  transform-style: preserve-3d;
  background-color: #020b13;
  box-sizing: border-box;
  border-radius: 50%;
  align-self: center;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.2);
}

#coin.flipping {
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
}

#coin>* {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  backface-visibility: hidden;
  border-radius: 50%;
  margin: 16px;
}

#front {
  z-index: 2;
}

#back {
  transform: rotateY(180deg);
}
</style>