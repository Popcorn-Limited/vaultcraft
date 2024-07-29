import { type Address, Hash, trim, getAddress, zeroHash, decodeAbiParameters, parseAbiParameters, createPublicClient, createWalletClient, http, maxUint256, Log, zeroAddress } from "viem";
import { mainnet } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import { SwapKind, Balancer, SingleSwap } from "@/lib/external/balancer";
import { ERC20 } from "@/lib/tokens/erc20";
import { BALANCER_VAULT, VCX, VCX_POOL_ID, WETH } from "@/lib/constants";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const runtime = 'nodejs';

type RequestBody = {
  event: {
    data: {
      block: {
        logs: Array<{
          account: {
            address: string;
          };
          topics: Array<Hash>;
          data: Hash;
          transaction: {
            hash: Hash;
            from: {
              address: Address;
            };
            to: {
              address: Address;
            };
          };
        }>;
      };
    }
  }
};

const minAmount = BigInt(process.env.MIN_AMOUNT as string)
const account = privateKeyToAccount(process.env.BOT_PRIVATE_KEY! as Hash);
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.MAINNET_RPC_URL!),
});
const walletClient = createWalletClient({
  account,
  chain: mainnet,
  transport: http(process.env.FLASHBOTS_RPC_URL!),
});
const balancer = new Balancer(
  account,
  getAddress(process.env.VCX_RECIPIENT!),
  publicClient,
  walletClient,
);

const erc20 = new ERC20(account, publicClient, walletClient);

export default async function POST(request: Request) {
  console.log(request)
  const watchList = process.env.WATCH_LIST!.split(',').map(address => getAddress(address));

  const allowance = await erc20.getAllowance(WETH, BALANCER_VAULT);
  if (allowance === BigInt(0)) {
    await erc20.approve(WETH, BALANCER_VAULT, maxUint256);
  }

  let wethBalance = await erc20.getBalance(WETH, account.address);

  const body: RequestBody = await request.json();

  const logs = body.event.data.block.logs;
  for (const log of logs) {
    if (wethBalance < minAmount) {
      console.log(`WETH Balance (${wethBalance}) lower than minAmount (${minAmount})`);
      return new Response(null, { status: 204 });
    }

    const tokenIn = getAddress(trim(log.topics[2]));

    if (tokenIn !== VCX) {
      // we only care about VCX sales
      return new Response(null, { status: 204 });
    }

    // we need to figure out who initiated the swap
    // so we check who's VCX was transferred out.
    // For that we check the tx's events for the VCX transfer event.
    const txHash = log.transaction.hash
    const tx = await publicClient.getTransactionReceipt({
      hash: txHash,
    });
    let user: Address = zeroAddress;
    tx.logs.forEach((log: Log) => {
      if (getAddress(log.address) === getAddress(VCX)) {
        const logData = decodeAbiParameters(
          parseAbiParameters('address'),
          log.topics[0]!
        );
        user = getAddress(logData[0]);
      }
    });

    if (!watchList.includes(user)) {
      console.log(`skipping swap for user ${user} with tx ${log.transaction.hash} because they are on the watch list`);
      return new Response(null, { status: 204 });
    }

    // [0] is the amount of VCX that's sold
    // [1] is the amount of WETH that's bought
    const amounts = decodeAbiParameters(
      parseAbiParameters('uint256,uint256'),
      log.data,
    );

    let wethAmount = amounts[1] > wethBalance ? wethBalance : amounts[1]
    if (wethAmount >= minAmount) {
      const swap: SingleSwap = {
        poolId: VCX_POOL_ID,
        kind: SwapKind.GIVEN_IN,
        assetIn: WETH,
        assetOut: VCX,
        amount: wethAmount,
        userData: zeroHash,
      };

      const swapTxHash = await balancer.swap(swap);
      const receipt = await publicClient.waitForTransactionReceipt({ hash: swapTxHash });
      if (receipt) {
        console.log(`executed swap for log ${log.transaction.hash} with txHash ${swapTxHash}`);
        wethBalance -= wethAmount;
      } else {
        console.log("Swap failed");
        return new Response(null, { status: 204 });
      }
    }
  }

  return new Response("ok", { status: 200 });
}