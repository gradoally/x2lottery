<script setup>
import { ref, computed, onMounted } from 'vue'
import { FaceSmileIcon } from '@heroicons/vue/24/solid';
import { HeadsOrTails } from '../../wrappers/HeadsOrTails';
import Modal from '../modals/Modal.vue';
import Button from '../common/Button.vue';
import { store } from '../../common/store';

const jettonSymbol = ref(import.meta.env.VITE_JETTON_SYMBOL);

const amount = ref(1);

const currentBalance = ref(0);

const modalOpen = ref(false);
const modalTitle = ref('');
const modalDescription = ref('');

const min_bet = ref(1)
const max_bet = ref(10);

const loading = ref(false);

let lastTransactionId = null;

const openModal = () => {
  modalOpen.value = true;
  modalTitle.value = "Bet placed!";
  modalDescription.value = "See the transaction on Tonviewer: ";
}

let isFlipping = false;
let currentDegrees = 0;

const playGame = async () => {
  if (isFlipping) return;

  lastTransactionId = await store.telegram.playGame(amount.value);

  modalOpen.value = true;
  modalTitle.value = "Bet placed!";

  currentBalance.value = await store.telegram.getWalletBalance();
}

const viewTransaction = () => {
  window.open(
    'https://tonviewer.com/transaction/' + lastTransactionId,
    '_blank'
  )

  modalOpen.value = false;
}

const incrementAmount = () => {
  if (amount.value + 0.1 <= (max_bet.value)) {
    amount.value = parseFloat((amount.value + 0.1).toFixed(1))
  }
}

const decrementAmount = () => {
  if (amount.value - 0.1 >= (min_bet.value)) {
    amount.value = parseFloat((amount.value - 0.1).toFixed(1))
  }
}

onMounted(async () => {
  await store.telegram.initConnectWalletButton('ton-connect-button')

  const config = await store.telegram.getData();

  min_bet.value = config.min_bet;
  max_bet.value = config.max_bet;

  amount.value = parseFloat(config.min_bet);

  currentBalance.value = await store.telegram.getWalletBalance();

  setInterval(async () => {
    loading.value = true;
    currentBalance.value = await store.telegram.getWalletBalance();
    loading.value = false;
  }, 3000);
});
</script>

<template>
  <div class="text-center flex flex-col h-full">
    <div class="text-center text-3xl uppercase p-5">
      <button id="ton-connect-button" type="button"></button>
    </div>
    <div class="flex flex-col justify-center content-center">
      <div class="flex justify-center">
        <div>
          <div id="front" @click="playGame()"><img src="/icon.png" class="pulse h-[30vh]"></div>
        </div>
      </div>
      <div class="mt-6">
        <form class="max-w-xs mx-auto">
          <label for="quantity-input" class="block mb-2 text-sm font-medium uppercase text-white">Your bet</label>
          <div class="flex justify-center">
            <div class="relative flex items-center max-w-[8rem]">

              <a @click="decrementAmount()"
                class="bg-blue-800 0 border-blue-900 rounded-s-lg p-3 h-11 mr-1">
                <svg class="w-3 h-3 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 18 2">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M1 1h16" />
                </svg>
              </a>

              <input type="number" v-model="amount" data-input-counter aria-describedby="helper-text-explanation"
                class="bg-blue-50 border-x-0 h-11 focus:border-none text-center text-gray-900 font-bold text-sm block w-full py-2.5"
                placeholder="1" required />

              <a @click="incrementAmount()"
                class="bg-blue-800 0 border-blue-900 rounded-e-lg p-3 h-11 ml-1">
                <svg class="w-3 h-3 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                  fill="none" viewBox="0 0 18 18">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 1v16M1 9h16" />
                </svg>
              </a>

            </div>
          </div>

          <p id="helper-text-explanation" class="mt-4 text-sm text-gray-400">Min: {{ min_bet }} TON - Max: {{ max_bet }}
            TON</p>
        </form>

        <div class="mt-5">
          <Button @click="playGame()" :disabled="!store.telegram.walletAccount">
            Place your bet
          </Button>
        </div>


        <div v-if="store.telegram.walletAccount" class="mt-8 text-xs">
          <div class="font-black uppercase text-[10px]">Your balance</div>
          <div class="font-black text-lg">
            <div class="flex justify-center">
              <div>
                {{ currentBalance }} TON
              </div>
              <div class="w-5">
                <svg v-if="loading" class="animate-spin ml-3 h-7 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                  </path>
                </svg>
              </div>
            </div>
          </div>
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

  <Modal :isOpen="modalOpen" @confirm="viewTransaction()" :confirmButtonEnabled="true" @close="modalOpen = false"
    :confirmButtonText="'View it on Tonviewer'" :cancelButtonText="'Close'" :title="modalTitle">
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