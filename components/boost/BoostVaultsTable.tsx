import type { VaultData } from "@/lib/types";
import type { Address } from "viem";

import BoostVaultRow from "@/components/boost/BoostVaultRow";
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
            <th />
            <th className="font-normal text-left whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.tvl}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.boost}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.weight}
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              {LABELS_WITH_TOOLTIP.emission}
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
  boost: (
    <WithTooltip content="The current range of additional rewards in oVCX on this vault">
      Current Boost
    </WithTooltip>
  ),
  weight: (
    <WithTooltip content="The current and upcoming allocation of votes for this vault. This percentage of the weekly emissions will be directed towards the vault">
      Vote Allocation
    </WithTooltip>
  ),
  emission: (
    <WithTooltip content="The current and upcoming amount of oVCX directed to this vault">
      Emmissions
    </WithTooltip>
  ),
  myVotes: (
    <WithTooltip content="Your vote percentage for the next weekly rewards">
      My votes
    </WithTooltip>
  ),
};
