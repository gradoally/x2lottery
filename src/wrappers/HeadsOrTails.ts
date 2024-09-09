import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';
export const Op = { Setup: 0, Deploy: 1, TopUp: 2, Withdraw: 3, };
export const Result = { ValueError: 0, Loss: 1, };
export type HeadsOrTailsConfig = { owner: Address, min_bet: number | bigint, max_bet: number | bigint, mul_num: number | bigint, mul_denom: number | bigint, };
export function headsOrTailsConfigToCell(config: HeadsOrTailsConfig): Cell { return beginCell()
    .storeAddress(config.owner)
    .storeCoins(config.min_bet)
    .storeCoins(config.max_bet)
    .storeUint(config.mul_num, 16)
    .storeUint(config.mul_denom, 16)
    .endCell(); }
export class HeadsOrTails implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}
    static createFromAddress(address: Address) { return new HeadsOrTails(address); }
    static createFromConfig(config: HeadsOrTailsConfig, code: Cell, workchain = 0) {
        const data = headsOrTailsConfigToCell(config);
        const init = { code, data };
        return new HeadsOrTails(contractAddress(workchain, init), init); }
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) { await provider.internal(via, { 
        value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: beginCell().storeUint(Op.Deploy, 32).endCell(), }); }
    async sendBet(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, { value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: beginCell().endCell(),}); }
    async sendTopUp(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, { value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: beginCell().storeUint(Op.TopUp, 32).endCell(),}); }
    async sendSetup(provider: ContractProvider, via: Sender, value: bigint, owner: Address, min_bet: number | bigint, max_bet: number | bigint, mul_num: number | bigint, mul_denom: number | bigint, ) {
        await provider.internal(via, { value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: beginCell().storeUint(Op.Setup, 32).storeUint(0, 64)
            .storeAddress(owner).storeCoins(min_bet).storeCoins(max_bet).storeUint(mul_num, 16).storeUint(mul_denom, 16).endCell(),}); }
    async sendWithdraw(provider: ContractProvider, via: Sender, value: bigint, w_amount: bigint) {
        await provider.internal(via, { value, sendMode: SendMode.PAY_GAS_SEPARATELY, body: beginCell().storeUint(Op.Withdraw, 32).storeUint(0, 64).storeCoins(w_amount).endCell(),}); }
    async getData(provider: ContractProvider) {
        const result = await provider.get('get_smc_data', []);
        return result.stack.readCell(); } }
