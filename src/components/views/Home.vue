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
  <div class="text-center flex flex-col h-full pt-10">
    <div class="text-center text-3xl uppercase p-5">
      <button id="ton-connect-button" type="button"></button>
    </div>
    <div class="flex-1 flex flex-col justify-center content-center">
      <div class="flex justify-center">
        <div id="coin">
          <div id="front"><img src="/icon.png" class="pulse w-[60vw]"></div>
          <div id="back"><img src="/loser.png" class="pulse w-[60vw]"></div>
        </div>
      </div>
      <div class="mt-12">
        <Button @click="playGame()" :disabled="!store.telegram.walletAccount">
          Bet
        </Button>
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