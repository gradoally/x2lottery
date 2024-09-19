import { Reactive, reactive } from "vue";
import { TonConnectUI, TonConnectUiOptions, Account } from "@tonconnect/ui";
import { InitDataParsed, retrieveLaunchParams } from "@telegram-apps/sdk";
import { Address, Cell, fromNano, toNano, TonClient } from "@ton/ton";
import { HeadsOrTails } from "../../wrappers/HeadsOrTails";
import { TonConnectSender } from "../../wrappers/TonConnectSender";

interface Telegram {
  walletAccount: Account | null | undefined;
  tonConnectUI: TonConnectUI | null;
  tonClient: TonClient | null;
  initDataRaw: string | undefined | null;
  initData: InitDataParsed | undefined | null;
  init: () => Promise<void>;
  initTelegramData: () => void;
  initWallet: () => Promise<void>;
  initConnectWalletButton: (buttonRootId: string | null) => Promise<void>;
  initClient: () => Promise<void>;
  playGame: (amount: number) => Promise<string | null>;
  getData: () => Promise<{ min_bet: string; max_bet: string } | null>;
  getWalletBalance: () => Promise<string | null>;
}

export const Telegram: Reactive<Telegram> = reactive<Telegram>({
  walletAccount: null,
  tonConnectUI: null,
  tonClient: null,
  initData: null,
  initDataRaw: null,
  async init() {
    this.initTelegramData();
    this.initWallet();
    this.initClient();
  },
  initTelegramData() {
    try {
      const launchParams = retrieveLaunchParams();
      this.initDataRaw = launchParams.initDataRaw;
      this.initData = launchParams.initData;
    } catch (e) {
      console.log('not in telegram app');
    }
  },
  async initWallet() {
    await this.tonConnectUI?.getWallets();

    this.walletAccount = this.tonConnectUI?.account;
  },
  async initConnectWalletButton(buttonRootId: string | null) {
    this.tonConnectUI = new TonConnectUI({
      manifestUrl: import.meta.env.VITE_TELEGRAM_MANIFEST_URL,
      buttonRootId: buttonRootId,
    });

    this.tonConnectUI.uiOptions = {
      actionsConfiguration: {
        returnStrategy: 'back',
        twaReturnUrl: import.meta.env.VITE_TELEGRAM_BOT_URL,
      }
    } as TonConnectUiOptions;

    this.tonConnectUI.onModalStateChange(async (state) => {
      if (
        state.status === "closed" &&
        state.closeReason === "wallet-selected"
      ) {
        await this.initWallet();
      }
    });

    this.tonConnectUI.onStatusChange((status) => {
      if (!status) {
        this.walletAccount = null;
      }
    });
  },
  async initClient() {
    this.tonClient = new TonClient({
      endpoint: "https://toncenter.com/api/v2/jsonRPC",
    });
  },
  async playGame(amount: number) {
    const collectionAddress = import.meta.env.VITE_TON_CONTRACT_ADDRESS;
    const address = Address.parse(collectionAddress);

    const contractProvider = this.tonClient?.open(
      HeadsOrTails.createFromAddress(address)
    );

    if (this.tonConnectUI) {
      const tonConnectSender = new TonConnectSender(this.tonConnectUI);

      await contractProvider?.sendBet(tonConnectSender, toNano(amount));

      const cell = Cell.fromBase64(
        tonConnectSender.lastTransactionResponse?.boc ?? ""
      );
      const buffer = cell.hash();
      const hashHex = buffer.toString("hex");

      return hashHex;
    }

    return null;
  },
  async getData() {
    const collectionAddress = import.meta.env.VITE_TON_CONTRACT_ADDRESS;
    const address = Address.parse(collectionAddress);

    const tonClient = new TonClient({
      endpoint: "https://toncenter.com/api/v2/jsonRPC",
    });

    const contractProvider = tonClient.open(
      HeadsOrTails.createFromAddress(address)
    );

    if (this.tonConnectUI) {
      const data = (await contractProvider.getData()).beginParse();
      data.loadAddress();
      const min_bet = fromNano(data.loadCoins());
      const max_bet = fromNano(data.loadCoins());

      return {
        min_bet,
        max_bet,
      };
    }

    return null;
  },
  async getWalletBalance() {
    try {
      const balance = await this.tonClient?.getBalance(
        Address.parse(this.walletAccount?.address ?? "")
      );
      return fromNano(balance ?? 0);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }

    return null;
  },
});
