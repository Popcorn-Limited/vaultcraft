import { useEffect, useState } from "react";
import { Address, useAccount, } from "wagmi";
import { getAddress } from "viem";
import { useAtom } from "jotai";
import { yieldOptionsAtom } from "@/lib/atoms/sdk";
import { NumberFormatter, formatAndRoundNumber, formatNumber } from "@/lib/utils/formatBigNumber";
import MarkdownRenderer from "@/components/vault/MarkdownRenderer";
import AssetWithName from "@/components/vault/AssetWithName";
import VaultInputs from "@/components/vault/VaultInputs";
import Accordion from "@/components/common/Accordion";
import TokenIcon from "@/components/common/TokenIcon";
import Title from "@/components/common/Title";
import { Token, VaultData } from "@/lib/types";


function getBaseToken(vaultData: VaultData): Token[] {
  const baseToken = [vaultData.vault, vaultData.asset]
  if (!!vaultData.gauge) baseToken.push(vaultData.gauge)
  return baseToken;
}

export default function SmartVault({
  vaultData,
  searchString,
  deployer,
}: {
  vaultData: VaultData,
  searchString: string,
  deployer?: Address
}) {
  const [yieldOptions] = useAtom(yieldOptionsAtom);
  const { address: account } = useAccount();
  const vault = vaultData.vault;
  const asset = vaultData.asset;
  const gauge = vaultData.gauge;
  const baseToken = getBaseToken(vaultData);

  const [apy, setApy] = useState<number | undefined>(0);

  useEffect(() => {
    if (!apy) {
      // @ts-ignore
      yieldOptions?.getApy(vaultData.chainId, vaultData.metadata.optionalMetadata.resolver, vaultData.asset.address).then(res => setApy(!!res ? res.total : 0))
    }
  }, [apy])

  // Is loading / error
  if (!vaultData || baseToken.length === 0) return <></>
  // Dont show if we filter by deployer
  if (!!deployer && getAddress(deployer) !== getAddress(vaultData?.metadata?.creator)) return <></>
  // Vault is not in search term
  if (searchString !== "" &&
    !vault.name.toLowerCase().includes(searchString) &&
    !vault.symbol.toLowerCase().includes(searchString) &&
    !vaultData.metadata.optionalMetadata.protocol?.name.toLowerCase().includes(searchString)) return <></>
  return (<Accordion
    header={
      <div className="w-full flex flex-wrap items-center justify-between flex-col gap-4">

        <div className="flex items-center justify-between select-none w-full">
          <AssetWithName vault={vaultData} />
        </div>

        <div className="w-full flex justify-between gap-8 xs:gap-4">
          <div className="w-full mt-6 xs:mt-0">
            <p className="text-primary font-normal xs:text-[14px]">Your Wallet</p>
            <p className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
              <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                {`${formatAndRoundNumber(asset.balance, asset.decimals)} %`}
              </Title>
            </p>
          </div>

          <div className="w-full mt-6 xs:mt-0">
            <p className="text-primary font-normal xs:text-[14px]">Your Deposit</p>
            <div className="text-primary text-xl md:text-3xl leading-6 md:leading-8">
              <Title level={2} fontWeight="font-normal" as="span" className="mr-1 text-primary">
                {account ? '$ ' + (!!gauge ?
                        formatAndRoundNumber(gauge?.balance || 0, vault.decimals) :
                        formatAndRoundNumber(vault.balance, vault.decimals)
                ) : "-"}
              </Title>
            </div>
          </div>

          <div className="w-full mt-6 xs:mt-0">
            <p className="leading-6 text-primary xs:text-[14px]">TVL</p>
            <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
              $ {NumberFormatter.format(vaultData.tvl)}
            </Title>
          </div>
        </div>

        <div className="w-full flex justify-between gap-8 xs:gap-4">
          <div className="w-full mt-6 xs:mt-0">
            <p className="font-normal text-primary xs:text-[14px]">vAPY</p>
            <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
              {apy ? `${NumberFormatter.format(apy)} %` : "0 %"}
            </Title>
          </div>
          <div className="w-full mt-6 xs:mt-0">
            <p className="font-normal text-primary xs:text-[14px]">Boost APY</p>
            <Title as="span" level={2} fontWeight="font-normal" className="text-primary">
              {'3 - 7%'}
            </Title>
          </div>
          <div className="w-full h-fit mt-auto xs:opacity-0">
            <p className="font-normal text-primary text-[15px] mb-1">⚡ Zap available</p>
          </div>
        </div>

      </div>
    }
  >
    <div className="flex flex-col md:flex-row mt-8 gap-8">

      <section className="flex flex-col w-full md:w-4/12 gap-8">
        <div className="bg-white flex-grow rounded-lg border border-customLightGray w-full p-6">
          <VaultInputs
            vault={vault}
            asset={asset}
            gauge={gauge}
            tokenOptions={[vaultData.vault, vaultData.asset]}
            chainId={vaultData.chainId}
          />
        </div>
      </section>

      <section className="bg-white rounded-lg border border-customLightGray w-full md:w-8/12 p-6 md:p-8 hidden md:flex flex-col">
        <div className="flex flex-row items-center">
          <TokenIcon token={asset} icon={asset.logoURI} chainId={vaultData.chainId} imageSize="w-8 h-8" />
          <Title level={2} as="span" className="text-gray-900 mt-1.5 ml-3">
            {asset.name}
          </Title>
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# ${vaultData.metadata.optionalMetadata?.token?.name} \n${vaultData.metadata.optionalMetadata?.token?.description}`} />
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# ${vaultData.metadata.optionalMetadata?.protocol?.name} \n${vaultData.metadata.optionalMetadata?.protocol?.description}`} />
        </div>
        <div className="mt-8">
          <MarkdownRenderer content={`# Strategies \n${vaultData.metadata.optionalMetadata?.strategy?.description}`} />
        </div>
        {/* <div className="mt-8">
          <MarkdownRenderer content={`# Addresses \nVault: ${vault.address} \nAsset: ${asset.address}`} />
        </div> */}
      </section>

    </div>
  </Accordion>
  )
}
