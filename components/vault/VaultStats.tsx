import { Address } from "viem";
import { NumberFormatter, formatAndRoundNumber } from "@/lib/utils/formatBigNumber";
import Title from "@/components/common/Title";
import { LockVaultData, VaultData } from "@/lib/types";
import { roundToTwoDecimalPlaces } from "@/lib/utils/helpers";
import ResponsiveTooltip from "@/components/common/Tooltip";

interface VaultStatProps {
  vaultData: VaultData | LockVaultData;
  account?: Address;
  zapAvailable?: boolean;
}

export default function VaultStats({
  vaultData,
  account,
  zapAvailable,
}: VaultStatProps): JSX.Element {
  const { asset, vault, gauge, apy, gaugeMinApy, gaugeMaxApy } = vaultData;
  const baseTooltipId = vault.address.slice(1);
  const isLockVault = vaultData.metadata.type === "single-asset-lock-vault-v1";

  return (
    <>
      <div className="w-full flex justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p
            className="text-primary font-normal md:text-[14px]"
            id={`${baseTooltipId}-wallet`}
          >
            Your Wallet
          </p>
          <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title
              level={2}
              fontWeight="font-normal"
              as="span"
              className="mr-1 text-primary"
            >
              {`${formatAndRoundNumber(asset.balance, asset.decimals)}`}
            </Title>
          </p>
          <ResponsiveTooltip
            id={`${baseTooltipId}-wallet`}
            content={
              <p className="max-w-52">Deposit assets held in your wallet</p>
            }
          />
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p
            className="text-primary font-normal md:text-[14px]"
            id={`${baseTooltipId}-deposit`}
          >
            Your Deposit
          </p>
          <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
            <Title
              level={2}
              fontWeight="font-normal"
              as="span"
              className="mr-1 text-primary"
            >
              $
              {account
                ? isLockVault
                  ? formatAndRoundNumber(
                    (vaultData as LockVaultData).lock.amount * asset.price,
                    asset.decimals
                  )
                  : formatAndRoundNumber(
                    (!!gauge ? gauge.balance : vault.balance) * vault.price,
                    vault.decimals
                  )
                : "-"}
            </Title>
          </div>
          <ResponsiveTooltip
            id={`${baseTooltipId}-deposit`}
            content={<p className="max-w-52">Value of your vault deposits</p>}
          />
        </div>

        <div className="w-full mt-6 md:mt-0">
          <p
            className="leading-6 text-primary md:text-[14px]"
            id={`${baseTooltipId}-tvl`}
          >
            TVL
          </p>
          <Title
            as="span"
            level={2}
            fontWeight="font-normal"
            className="text-primary"
          >
            $ {vaultData.tvl < 1 ? "0" : NumberFormatter.format(vaultData.tvl)}
          </Title>
        </div>
        <ResponsiveTooltip
          id={`${baseTooltipId}-tvl`}
          content={
            <p className="max-w-52">
              Total value of all assets deposited into the vault
            </p>
          }
        />
      </div>

      <div className="w-full flex flex-row justify-between gap-8 md:gap-4">
        <div className="w-full mt-6 md:mt-0">
          <p
            className="font-normal text-primary md:text-[14px]"
            id={`${baseTooltipId}-vApy`}
          >
            vAPY
          </p>
          <Title
            as="span"
            level={2}
            fontWeight="font-normal"
            className="text-primary"
          >
            {apy
              ? `${NumberFormatter.format(roundToTwoDecimalPlaces(apy))} %`
              : "0 %"}
          </Title>
          <ResponsiveTooltip
            id={`${baseTooltipId}-vApy`}
            content={
              <p className="max-w-52">Current variable apy of the vault</p>
            }
          />
        </div>
        {isLockVault ? (
          <LockRewards
            vaultData={vaultData as LockVaultData}
            baseTooltipId={baseTooltipId}
          />
        ) : (
          <GaugeRewards vaultData={vaultData} baseTooltipId={baseTooltipId} />
        )}
      </div>
      {isLockVault && !!gauge && (
        <div className="w-full flex flex-row justify-between gap-8 md:gap-4">
          <GaugeRewards vaultData={vaultData} baseTooltipId={baseTooltipId} />
        </div>
      )}

      {zapAvailable && (
        <div className="w-full h-fit mt-auto">
          <p className="font-normal text-primary text-[15px] mb-1">
            ⚡ Zap available
          </p>
        </div>
      )}
    </>
  );
}

function LockRewards({
  vaultData,
  baseTooltipId,
}: {
  vaultData: LockVaultData;
  baseTooltipId: string;
}): JSX.Element {
  const totalRewardApy = vaultData.rewards.reduce((a, b) => a + b.rewardApy, 0);

  return (
    <>
      <div className="w-full mt-6 md:mt-0">
        <p
          className="font-normal text-primary md:text-[14px]"
          id={`${baseTooltipId}-minReward`}
        >
          Min Rewards
        </p>
        <Title
          as="span"
          level={2}
          fontWeight="font-normal"
          className="text-primary"
        >
          {totalRewardApy ? (totalRewardApy / 4).toFixed(2) : "-"} %
        </Title>
        <ResponsiveTooltip
          id={`${baseTooltipId}-minReward`}
          content={
            <p className="max-w-52">
              Minimum reward APR based on most recent distribution event
            </p>
          }
        />
      </div>

      <div className="w-full mt-6 md:mt-0">
        <p
          className="font-normal text-primary md:text-[14px]"
          id={`${baseTooltipId}-maxReward`}
        >
          Max Rewards
        </p>
        <Title
          as="span"
          level={2}
          fontWeight="font-normal"
          className="text-primary"
        >
          {totalRewardApy ? totalRewardApy.toFixed(2) : "-"} %
        </Title>
        <ResponsiveTooltip
          id={`${baseTooltipId}-maxReward`}
          content={
            <p className="max-w-52">
              Maximum reward APR based on most recent distribution event
            </p>
          }
        />
      </div>
    </>
  );
}

function GaugeRewards({
  vaultData,
  baseTooltipId,
}: {
  vaultData: VaultData | LockVaultData;
  baseTooltipId: string;
}): JSX.Element {
  return (
    <>
      <div className="w-full mt-6 md:mt-0">
        <p
          className="font-normal text-primary md:text-[14px]"
          id={`${baseTooltipId}-minBoost`}
        >
          Min Boost
        </p>
        <Title
          as="span"
          level={2}
          fontWeight="font-normal"
          className="text-primary"
        >
          {vaultData.gaugeMinApy?.toFixed(2) || "-"} %
        </Title>
        <ResponsiveTooltip
          id={`${baseTooltipId}-minBoost`}
          content={
            <p className="max-w-52">
              Minimum oVCX boost APR based on most current epoch&apos;s
              distribution
            </p>
          }
        />
      </div>

      <div className="w-full mt-6 md:mt-0">
        <p
          className="font-normal text-primary md:text-[14px]"
          id={`${baseTooltipId}-maxBoost`}
        >
          Max Boost
        </p>
        <Title
          as="span"
          level={2}
          fontWeight="font-normal"
          className="text-primary"
        >
          {vaultData.gaugeMaxApy?.toFixed(2) || "-"} %
        </Title>
        <ResponsiveTooltip
          id={`${baseTooltipId}-maxBoost`}
          content={
            <p className="max-w-52">
              Maximum oVCX boost APR based on most current epoch&apos;s
              distribution
            </p>
          }
        />
      </div>
    </>
  );
}
