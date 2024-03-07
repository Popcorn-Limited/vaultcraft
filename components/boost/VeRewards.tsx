import { useEffect, useState } from "react";
import { Address, formatEther } from "viem";
import { goerli } from "viem/chains";
import { useAccount } from "wagmi";
import MainActionButton from "@/components/button/MainActionButton";
import getClaimableVeReward from "@/lib/feeDistributor/getClaimableVeReward";
import getVeApy from "@/lib/feeDistributor/getVeApy";
import { useClaimTokens } from "@/lib/feeDistributor/useClaimToken";
import { getVeAddresses } from "@/lib/constants";

function noOp() {}

const { WETH: WETH, FeeDistributor: FEE_DISTRIBUTOR } = getVeAddresses();

export default function VeRewards(): JSX.Element {
  const { address: account } = useAccount();
  const { write: claimTokens = noOp } = useClaimTokens(
    FEE_DISTRIBUTOR,
    account as Address,
    [WETH]
  );

  const [apy, setApy] = useState<number>(0);

  useEffect(() => {
    if (apy === 0) {
      getVeApy({
        chain: goerli,
        address: FEE_DISTRIBUTOR,
        token: "0x2D9B33e9918Dce388d1Cb8Bf09D4E827b899e9d9",
      }).then((res) => setApy(res));
    }
  }, [apy]);

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [claimableVeReward, setClaimableVeReward] = useState<bigint>(BigInt(0));

  useEffect(() => {
    async function getClaimableReward() {
      setInitalLoad(true);
      if (account) setAccountLoad(true);
      getClaimableVeReward({
        chain: goerli,
        address: FEE_DISTRIBUTOR,
        user: account as Address,
        token: WETH,
      }).then((res) => setClaimableVeReward(res));
    }
    if (!account && !initalLoad) getClaimableReward();
    if (account && !accountLoad) getClaimableReward();
  }, [account]);

  return (
    <div className="lg:w-1/2 bg-[#FAF9F4] border border-[#353945] rounded-3xl p-8 text-primary">
      <h3 className="text-2xl pb-6 border-b border-[#353945]">
        Total veVCX Rewards
      </h3>
      <span className="flex flex-row items-center justify-between mt-6">
        <p className="">APR</p>
        <p className="font-bold">{apy} %</p>
      </span>
      <span className="flex flex-row items-center justify-between">
        <p className="">Claimable WETH</p>
        <p className="font-bold">
          {parseFloat(formatEther(claimableVeReward)).toFixed(3)} wETH
        </p>
      </span>
      <div className="mt-5 flex flex-row items-center justify-between space-x-8">
        <MainActionButton
          label="Claim WETH"
          handleClick={() => claimTokens()}
          disabled={Number(claimableVeReward) === 0}
        />
      </div>
    </div>
  );
}
