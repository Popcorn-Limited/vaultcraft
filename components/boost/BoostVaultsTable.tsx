import type { VaultData } from "@/lib/types";
import type { Address } from "viem";

import BoostVaultRow from "@/components/vault/BoostVaultRow";

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
            <th className="font-normal text-left whitespace-nowrap">TVL</th>
            <th className="font-normal text-right whitespace-nowrap">
              Min Boost
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              Max Boost
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              Current Weight
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              Upcoming Weight
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              Tokens emitted
            </th>
            <th className="font-normal text-right whitespace-nowrap">
              Upcoming Tokens
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
