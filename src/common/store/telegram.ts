import { Reactive, reactive } from "vue";
import { TonConnectUI, TonConnectUiOptions, Account } from "@tonconnect/ui";
import { InitDataParsed, retrieveLaunchParams } from "@telegram-apps/sdk";
import { Address, toNano, TonClient } from "@ton/ton";
import { HeadsOrTails } from "../../wrappers/HeadsOrTails";
import { TonConnectSender } from "../../wrappers/TonConnectSender";

interface Telegram {
  walletAccount: Account | null | undefined;
  tonConnectUI: TonConnectUI | null;
  initDataRaw: string | undefined | null;
  initData: InitDataParsed | undefined | null;
  init: () => Promise<void>;
  initTelegramData: () => void;
  initWallet: () => Promise<void>;
  initConnectWalletButton: (buttonRootId: string | null) => Promise<void>;
  playGame: (amount: number) => Promise<void>;
}

export const Telegram: Reactive<Telegram> = reactive<Telegram>({
  walletAccount: null,
  tonConnectUI: null,
  initData: null,
  initDataRaw: null,
  async init() {
    this.initTelegramData();
    this.initWallet();
  },
  initTelegramData() {
    const launchParams = retrieveLaunchParams();

    this.initDataRaw = launchParams.initDataRaw;
    this.initData = launchParams.initData;
  },
  async initWallet() {
    await this.tonConnectUI?.getWallets();

    console.log(this.tonConnectUI);

    this.walletAccount = this.tonConnectUI?.account;

    console.log(this.walletAccount);
  },
  async initConnectWalletButton(buttonRootId: string | null) {
    this.tonConnectUI = new TonConnectUI({
      manifestUrl: import.meta.env.VITE_TELEGRAM_MANIFEST_URL,
      buttonRootId: buttonRootId,
    });

    this.tonConnectUI.uiOptions = {
      twaReturnUrl: import.meta.env.VITE_TELEGRAM_BOT_URL,
    } as TonConnectUiOptions;

    this.tonConnectUI.onModalStateChange(async (state) => {
      console.log(state);

      if (
        state.status === "closed" &&
        state.closeReason === "wallet-selected"
      ) {
        await this.initWallet();
      }
    });

    this.tonConnectUI.onStatusChange((status) => {
      if(!status) {
        this.walletAccount = null;
      }
    });

    console.log(this.tonConnectUI);
  },
  async playGame(amount: number) {
    const collectionAddress = import.meta.env.VITE_TON_CONTRACT_ADDRESS;
    const address = Address.parse(collectionAddress);

    const tonClient = new TonClient({
      endpoint: "https://toncenter.com/api/v2/jsonRPC",
    });

    const contractProvider = tonClient.open(
      HeadsOrTails.createFromAddress(address)
    );

    if (this.tonConnectUI) {
      return await contractProvider.sendBet(
        new TonConnectSender(this.tonConnectUI),
        toNano(amount)
      );
    }
  },
});
