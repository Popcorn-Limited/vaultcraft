import { FireEventArgs } from "@masa-finance/analytics-sdk";
import { atom } from "jotai";
import { YieldOptions } from 'vaultcraft-sdk';

export const yieldOptionsAtom = atom<YieldOptions | null>(null);

interface MasaFunctions {
  fireEvent: (type: string, { user_address, network, contract_address, asset_amount, asset_ticker, additionalEventData, }: FireEventArgs) => Promise<void>;
  fireLoginEvent: ({ user_address }: {
    user_address: string;
  }) => Promise<void>;
  firePageViewEvent: ({ page, user_address, }: {
    page: string;
    user_address?: string | undefined;
  }) => Promise<void>;
  fireConnectWalletEvent: ({ user_address, wallet_type, }: {
    user_address: string;
    wallet_type: string;
  }) => Promise<void>;
}

export const masaAtom = atom<MasaFunctions | null>(null)
