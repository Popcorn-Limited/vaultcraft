import axios from "axios"
import { Address, ByteArray, Hex, WalletClient, hashTypedData, pad, zeroAddress } from "viem";

const GPv2Settlement = "0x9008D19f58AAbD9eD0D60971565AA8510560ab41"

const cowDomain = {
  name: "Gnosis Protocol",
  version: "v2",
  chainId: 1,
  verifyingContract: GPv2Settlement,
}

export enum OrderKind {
  /**
   * A sell order.
   */
  SELL = "sell",
  /**
   * A buy order.
   */
  BUY = "buy",
}

/**
 * Gnosis Protocol v2 order data.
 */
export interface Order {
  /**
   * Sell token address.
   */
  sellToken: string;
  /**
   * Buy token address.
   */
  buyToken: string;
  /**
   * An optional address to receive the proceeds of the trade instead of the
   * owner (i.e. the order signer).
   */
  receiver?: string;
  /**
   * The order sell amount.
   *
   * For fill or kill sell orders, this amount represents the exact sell amount
   * that will be executed in the trade. For fill or kill buy orders, this
   * amount represents the maximum sell amount that can be executed. For partial
   * fill orders, this represents a component of the limit price fraction.
   */
  sellAmount: string;
  /**
   * The order buy amount.
   *
   * For fill or kill sell orders, this amount represents the minimum buy amount
   * that can be executed in the trade. For fill or kill buy orders, this amount
   * represents the exact buy amount that will be executed. For partial fill
   * orders, this represents a component of the limit price fraction.
   */
  buyAmount: string;
  /**
   * The timestamp this order is valid until
   */
  validTo: number | Date;
  /**
   * Arbitrary application specific data that can be added to an order. This can
   * also be used to ensure uniqueness between two orders with otherwise the
   * exact same parameters.
   */
  appData: ByteArray | Hex;
  /**
   * Fee to give to the protocol.
   */
  feeAmount: string;
  /**
   * The order kind.
   */
  kind: OrderKind;
  /**
   * Specifies whether or not the order is partially fillable.
   */
  partiallyFillable: boolean;
  /**
   * Specifies how the sell token balance will be withdrawn. It can either be
   * taken using ERC20 token allowances made directly to the Vault relayer
   * (default) or using Balancer Vault internal or external balances.
   */
  sellTokenBalance?: OrderBalance;
  /**
   * Specifies how the buy token balance will be paid. It can either be paid
   * directly in ERC20 tokens (default) in Balancer Vault internal balances.
   */
  buyTokenBalance?: OrderBalance;
}

/**
 * Normalized representation of an {@link Order} for EIP-712 operations.
 */
export type NormalizedOrder = Omit<
  Order,
  "validTo" | "appData" | "kind" | "sellTokenBalance" | "buyTokenBalance"
> & {
  receiver: string;
  validTo: number;
  appData: string;
  kind: "sell" | "buy";
  sellTokenBalance: "erc20" | "external" | "internal";
  buyTokenBalance: "erc20" | "internal";
};

/**
 * The signing scheme used to sign the order.
 */
export enum SigningScheme {
  /**
   * The EIP-712 typed data signing scheme. This is the preferred scheme as it
   * provides more infomation to wallets performing the signature on the data
   * being signed.
   *
   * <https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#definition-of-domainseparator>
   */
  EIP712 = 0b00,
  /**
   * Message signed using eth_sign RPC call.
   */
  ETHSIGN = 0b01,
  /**
   * Smart contract signatures as defined in EIP-1271.
   *
   * <https://eips.ethereum.org/EIPS/eip-1271>
   */
  EIP1271 = 0b10,
  /**
   * Pre-signed order.
   */
  PRESIGN = 0b11,
}

/**
 * The EIP-712 type fields definition for a Gnosis Protocol v2 order.
 */
export const ORDER_TYPE_FIELDS = [
  { name: "sellToken", type: "address" },
  { name: "buyToken", type: "address" },
  { name: "receiver", type: "address" },
  { name: "sellAmount", type: "uint256" },
  { name: "buyAmount", type: "uint256" },
  { name: "validTo", type: "uint32" },
  { name: "appData", type: "bytes32" },
  { name: "feeAmount", type: "uint256" },
  { name: "kind", type: "string" },
  { name: "partiallyFillable", type: "bool" },
  { name: "sellTokenBalance", type: "string" },
  { name: "buyTokenBalance", type: "string" },
];


/**
 * Order balance configuration.
 */
export enum OrderBalance {
  /**
   * Use ERC20 token balances.
   */
  ERC20 = "erc20",
  /**
   * Use Balancer Vault external balances.
   *
   * This can only be specified specified for the sell balance and allows orders
   * to re-use Vault ERC20 allowances. When specified for the buy balance, it
   * will be treated as {@link OrderBalance.ERC20}.
   */
  EXTERNAL = "external",
  /**
   * Use Balancer Vault internal balances.
   */
  INTERNAL = "internal",
}

/**
 * Normalizes the balance configuration for a buy token. Specifically, this
 * function ensures that {@link OrderBalance.EXTERNAL} gets normalized to
 * {@link OrderBalance.ERC20}.
 *
 * @param balance The balance configuration.
 * @returns The normalized balance configuration.
 */
export function normalizeBuyTokenBalance(
  balance: OrderBalance | undefined,
): OrderBalance.ERC20 | OrderBalance.INTERNAL {
  switch (balance) {
    case undefined:
    case OrderBalance.ERC20:
    case OrderBalance.EXTERNAL:
      return OrderBalance.ERC20;
    case OrderBalance.INTERNAL:
      return OrderBalance.INTERNAL;
    default:
      throw new Error(`invalid order balance ${balance}`);
  }
}

/**
 * Normalizes a timestamp value to a Unix timestamp.
 * @param time The timestamp value to normalize.
 * @return Unix timestamp or number of seconds since the Unix Epoch.
 */
export function timestamp(t: number | Date): number {
  return typeof t === "number" ? t : ~~(t.getTime() / 1000);
}


/**
 * Normalizes an app data value to a 32-byte hash.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
export function hashify(h: ByteArray | Hex | number): string {
  return typeof h === "number"
    ? `0x${h.toString(16).padStart(64, "0")}`
    : pad(h, { size: 32 }) as string;
}

/**
 * Normalizes an order for hashing and signing, so that it can be used with
 * Ethers.js for EIP-712 operations.
 * @param hashLike A hash-like value to normalize.
 * @returns A 32-byte hash encoded as a hex-string.
 */
export function normalizeOrder(order: Order): NormalizedOrder {
  if (order.receiver === zeroAddress) {
    throw new Error("receiver cannot be address(0)");
  }

  const normalizedOrder = {
    ...order,
    sellTokenBalance: order.sellTokenBalance ?? OrderBalance.ERC20,
    receiver: order.receiver ?? zeroAddress,
    validTo: timestamp(order.validTo),
    appData: hashify(order.appData),
    buyTokenBalance: normalizeBuyTokenBalance(order.buyTokenBalance),
  };
  return normalizedOrder;
}


async function ecdsaSignTypedData(
  scheme: any,
  account: Address,
  owner: WalletClient,
  domain: any,
  types: any,
  data: NormalizedOrder,
): Promise<string> {
  let signature: string | null = null;

  switch (scheme) {
    case SigningScheme.EIP712:
      signature = await owner.signTypedData({ account, domain, types, primaryType: "Order", message: data });
      break;
    case SigningScheme.ETHSIGN:
      signature = await owner.signMessage({
        account,
        message: { raw: hashTypedData({ domain, types, primaryType: "Order", message: data }) },
      });
      break;
    default:
      throw new Error("invalid signing scheme");
  }
  return signature
}

export type SigningResult = { signature: string; signingScheme: SigningScheme }

export async function signOrder(
  order: Order,
  chainId: number,
  account: Address,
  signer: WalletClient,
  signingMethod: 'default' | 'v4' | 'int_v4' | 'v3' | 'eth_sign' = 'v4'
): Promise<any> {
  const scheme = signingMethod === 'eth_sign' ? SigningScheme.ETHSIGN : SigningScheme.EIP712
  return {
    scheme,
    data: await ecdsaSignTypedData(
      scheme,
      account,
      signer,
      cowDomain,
      { Order: ORDER_TYPE_FIELDS },
      normalizeOrder(order),
    ),
  }
}

interface ZapProps {
  sellToken: Address;
  buyToken: Address;
  amount: number;
  account: Address;
  signer: WalletClient;
  slippage?: number; // slippage allowance in BPS 
  tradeTimeout?: number; // in s
}

export default async function zap({ sellToken, buyToken, amount, account, signer, slippage = 100, tradeTimeout = 60 }: ZapProps): Promise<string> {
  console.log("getting quote")
  console.log({
    sellToken,
    buyToken,
    from: account,
    receiver: account,
    validTo: Math.ceil(Date.now() / 1000) + tradeTimeout,
    partiallyFillable: false,
    kind: "sell",
    sellAmountBeforeFee: amount.toLocaleString("fullwide", { useGrouping: false })
  })
  const quote = (await axios.post(
    "https://api.cow.fi/mainnet/api/v1/quote",
    JSON.stringify({
      sellToken,
      buyToken,
      from: account,
      receiver: account,
      validTo: Math.ceil(Date.now() / 1000) + tradeTimeout,
      partiallyFillable: false,
      kind: "sell",
      sellAmountBeforeFee: amount.toLocaleString("fullwide", { useGrouping: false })
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )).data.quote
  console.log({ quote })
  const order: Order = {
    sellToken: quote.sellToken,
    buyToken: quote.buyToken,
    receiver: quote.receiver,
    sellAmount: quote.sellAmount,
    buyAmount: ((Number(quote.buyAmount) * (10_000 - slippage)) / 10_000).toLocaleString("fullwide", { useGrouping: false }), // @dev we might need to format the number to cast it into a bigint
    validTo: Math.ceil(Date.now() / 1000) + tradeTimeout,
    feeAmount: quote.feeAmount,
    kind: quote.kind,
    partiallyFillable: false,
    sellTokenBalance: quote.sellTokenBalance,
    buyTokenBalance: quote.buyTokenBalance,
    appData: "0x0000000000000000000000000000000000000000000000000000000000000000"
  }
  console.log({ order })
  console.log("signing order")
  const signedOrder = await signOrder(
    order,
    1,
    account,
    signer)
  console.log("posting order")
  console.log({ signedOrder })
  console.log({
    orderReq: {
      ...order,
      signature: signedOrder.data,
      from: quote.receiver,
      signingScheme: quote.signingScheme,
      appData: "0x0000000000000000000000000000000000000000000000000000000000000000",
    }
  })
  // const orderId = (await axios.post(
  //   "https://api.cow.fi/mainnet/api/v1/orders",
  //   JSON.stringify({
  //     ...order,
  //     signature: signedOrder.data,
  //     from: quote.receiver,
  //     signingScheme: quote.signingScheme,
  //     appData: "0x0000000000000000000000000000000000000000000000000000000000000000",
  //   }),
  //   { headers: { 'Content-Type': 'application/json' } }
  // )).data
  return "orderId"
}