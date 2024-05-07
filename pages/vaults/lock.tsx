import MainActionButton from "@/components/button/MainActionButton";
import CardStat from "@/components/common/CardStat";
import ProtocolIcon from "@/components/common/ProtocolIcon";
import TokenIcon from "@/components/common/TokenIcon";
import NetworkSticker from "@/components/network/NetworkSticker";
import { StakingVaultAbi } from "@/lib/constants";
import { showLoadingToast } from "@/lib/toasts";
import { Clients, Token } from "@/lib/types";
import { RPC_URLS } from "@/lib/utils/connectors";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import { handleCallResult, simulateCall } from "@/lib/utils/helpers";
import { tokenPocketWallet } from "@rainbow-me/rainbowkit/dist/wallets/walletConnectors";
import axios from "axios";
import { useEffect, useState } from "react";
import { Address, createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

async function exitLockVault({ account, vault, clients }: { account: Address, vault: Address, clients: Clients }) {
  showLoadingToast("Exiting Lock Vault...");

  return handleCallResult({
    successMessage: "Exited Lock Vault!",
    simulationResponse: await simulateCall({
      account,
      contract: {
        address: vault,
        abi: StakingVaultAbi,
      },
      functionName: "withdraw",
      publicClient: clients.publicClient,
      args: [account, account],
    }),
    clients,
  });
}

async function getLockVaults(user: Address) {
  const { data: allVaults } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/42161.json`
  );
  const { data: vaultTokens } = await axios.get(
    `https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/archive/vaults/tokens/42161.json`
  );
  const lockVaults = Object.values(allVaults)
    .filter((vault: any) => vault.type === "single-asset-lock-vault-v1")


  const client = createPublicClient({
    chain: arbitrum,
    transport: http(RPC_URLS[arbitrum.id]),
  })

  const block = await client.getBlock({
    blockTag: "latest"
  })

  const locks = await client.multicall({
    contracts: lockVaults
      .map((vault: any) => {
        return [
          {
            address: vault.address,
            abi: StakingVaultAbi,
            functionName: "locks",
            args: [user]
          }
        ]
      })
      .flat(),
    allowFailure: false,
  }) as any[]

  let result: any[] = [];
  lockVaults.forEach((vault: any, i: number) => {
    result.push({
      address: vault.address,
      asset: vault.assetAddress,
      chainId: vault.chainId,
      unlockTime: Number(locks[i][0]),
      unlocked: block.timestamp >= locks[i][0],
      balance: Number(locks[i][1]),
      token: vaultTokens[vault.address]
    })
  })
  return result
}

export default function LockVaults() {
  const { address: account } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [lockVaults, setLockVaults] = useState<any[]>([])

  useEffect(() => {
    if (account) getLockVaults(account).then(res => setLockVaults(res))
  }, [account])

  return <div className="text-white">
    <section className="md:border-b border-customNeutral100 md:flex md:flex-row items-center justify-between py-10 px-4 md:px-8 md:gap-4">
      <div className="w-full md:w-max">
        <h1 className="text-5xl font-normal m-0 mb-4 md:mb-2 leading-0 text-white md:text-3xl leading-none">
          Lock Vaults
        </h1>
        <p className="text-customGray100 md:text-white md:opacity-80">
          Lock Vaults are discountinued. Please withdraw all your funds once ready.
        </p>
      </div>
    </section>

    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8 mt-4">
      {lockVaults.length > 0 ?
        <>
          {
            lockVaults.reduce((a, b) => a + b.balance, 0) > 0 ?
              lockVaults.filter(vault => vault.balance > 0).map(vault =>
                <div
                  key={vault.address}
                  className="w-full px-8 pt-6 pb-5 rounded-3xl border border-customNeutral100 group hover:bg-customNeutral200 [&_summary::-webkit-details-marker]:hidden"
                >
                  <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">
                    <div className="flex items-center justify-between select-none w-full">
                      <div className="flex items-center gap-4 max-w-full flex-wrap md:flex-nowrap flex-1">
                        <div className="relative">
                          <NetworkSticker chainId={vault.chainId} size={1} />
                          <TokenIcon
                            token={{} as Token}
                            icon={"https://cdn.furucombo.app/assets/img/token/FRAX.png"}
                            chainId={vault.chainId}
                            imageSize={"w-8 h-8"}
                          />
                        </div>
                        <h2
                          className={`text-2xl font-bold text-white mr-1 text-ellipsis overflow-hidden whitespace-nowrap smmd:flex-1 smmd:flex-nowrap xs:max-w-[80%] smmd:max-w-fit smmd:block`}
                        >
                          {vault.token.name}
                        </h2>
                        <div className="flex flex-row flex-wrap w-max space-x-2">
                          <ProtocolIcon
                            protocolName={"FraxLend"}
                            tooltip={{
                              id: vault.address.slice(1),
                              content: (
                                <p className="w-60">
                                  This vault uses a lending strategy on FraxLend using the FRAX market. Which generates compound interest on your FRAX by lending it out to borrowers.
                                </p>
                              ),
                            }}
                            size={1}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:flex md:flex-wrap md:justify-between md:gap-4">
                      <CardStat
                        id={`${vault.address.slice(1)}-deposit`}
                        label="Your Deposit"
                        value={`${formatAndRoundNumber(vault.balance, vault.token.decimals)}`}
                        tooltip="Vault Shares held in your wallet"
                      />
                      <CardStat
                        id={`${vault.address.slice(1)}-unlockDate`}
                        label="Unlock Date"
                        value={new Date(vault.unlockTime * 1000).toLocaleDateString()}
                        tooltip="The date when you are able to withdraw your funds"
                      />
                      <CardStat
                        id={`${vault.address.slice(1)}-tvl`}
                        label="Unlockable"
                        value={String(vault.unlocked)}
                        tooltip="Can you withdraw your funds"
                      />
                      <MainActionButton
                        label="Exit"
                        handleClick={() => exitLockVault({
                          account: account!,
                          vault: vault.address,
                          clients: { publicClient, walletClient: walletClient! },
                        })}
                        disabled={!vault.unlocked}
                      />
                    </div>
                  </div>
                </div>
              )
              : <p className="text-white">You have no deposits in any Lock Vaults</p>
          }
        </>
        : <p className="text-white">Loading Lock Vaults...</p>
      }
    </section>
  </div>
}