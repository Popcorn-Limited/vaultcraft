import type { VaultData } from "@/lib/types";
import type { Address } from "viem";

import BoostVaultRow from "@/components/vault/BoostVaultRow";
import { WithTooltip } from "@/components/common/Tooltip";

export default function BoostVaultsTable({
  vaults,
  voteData,
  votes,
  handleVotes,
}: {
  vaults: VaultData[];
  voteData: { gauge: string; canVote: boolean }[];
  votes: Record<string, number>;
  handleVotes: (val: number, index: Address) => void;
}) {
  return (
    <section className="text-white mt-12 w-full border rounded-xl overflow-hidden border-customNeutral100">
      <table className="w-full [&_td]:h-20 [&_th]:h-18 [&_td]:px-5 [&_th]:px-5">
        <thead className="bg-customNeutral200 border-b border-customNeutral100">
          <tr>
            <th/>
            <th className="font-normal text-left whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.tvl}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.minBoost}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.maxBoost}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.currentWeight}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.upcomingWeight}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.tokensEmitted}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.upcomingTokens}
            </th>
          </tr>
        </thead>
        <tbody>
          {vaults.map((vault) => (
            <BoostVaultRow
              {...vault}
              isVotingAvailable={
                voteData.find((v) => v.gauge === vault.gauge)?.canVote!
              }
              handleVotes={handleVotes}
              votes={votes}
              key={`boost-vault-${vault.address}`}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export const LABELS_WITH_TOOLTIP = {
  tvl: (
    <WithTooltip content="Total value of all assets deposited into the vault">
      TVL
    </WithTooltip>
  ),
  minBoost: (
    <WithTooltip content="Minimum oVCX boost APR based on most current epoch's distribution">
      Min Boost
    </WithTooltip>
  ),

  maxBoost: (
    <WithTooltip content="Maximum oVCX boost APR based on most current epoch's distribution">
      Max Boost
    </WithTooltip>
  ),
  currentWeight: (
    <WithTooltip content="Current allocation of weekly rewards for this gauge">
      Current Weight
    </WithTooltip>
  ),
  upcomingWeight: (
    <WithTooltip content="Upcoming allocation of weekly rewards for this gauge">
      Upcoming Weight
    </WithTooltip>
  ),
  tokensEmitted: (
    <WithTooltip content="Total tokens created for this weekly allocation">
      Tokens emitted
    </WithTooltip>
  ),
  upcomingTokens: (
    <WithTooltip content="Upcoming tokens to create for this weekly allocation">
      Upcoming Tokens
    </WithTooltip>
  ),
  newAllocation: (
    <WithTooltip content="Your new token distribution for the next weekly rewards">
      New allocation
    </WithTooltip>
  ),
  emittedTokens: (
    <WithTooltip content="Total tokens to be minted for this new allocation">
      Emitted tokens
    </WithTooltip>
  ),
  myVotes: (
    <WithTooltip content="Your allocating balance for the next weekly rewards">
      My votes
    </WithTooltip>
  ),
};
