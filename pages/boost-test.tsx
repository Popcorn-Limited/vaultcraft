import NoSSR from "react-no-ssr";
import { useAccount, useBalance, usePublicClient, useWalletClient } from "wagmi";
import { Address, WalletClient } from "viem";
import { useEffect, useState } from "react";
import { getVeAddresses } from "@/lib/constants";
import { hasAlreadyVoted } from "@/lib/gauges/hasAlreadyVoted";
import { Token, VaultData } from "@/lib/types";
import StakingInterface from "@/components/boost/StakingInterface";
import { sendVotes } from "@/lib/gauges/interactions";
import Gauge from "@/components/boost/Gauge";
import LockModal from "@/components/boost/modals/lock/LockModal";
import ManageLockModal from "@/components/boost/modals/manage/ManageLockModal";
import OptionTokenModal from "@/components/boost/modals/optionToken/OptionTokenModal";
import MainActionButton from "@/components/button/MainActionButton";
import { useAtom } from "jotai";
import { vaultsAtom } from "@/lib/atoms/vaults";
import OptionTokenInterface from "@/components/boost/OptionTokenInterface";
import LpModal from "@/components/boost/modals/lp/LpModal";
import { voteUserSlopes } from "@/lib/gauges/useGaugeWeights";
import NetworkFilter from "@/components/network/NetworkFilter";
import SearchBar from "@/components/input/SearchBar";
import VaultsSorting from "@/components/vault/VaultsSorting";
import useNetworkFilter from "@/lib/useNetworkFilter";
import { ChainId } from "@/lib/utils/connectors";

const VOTING_ESCROW = "0xC28a4F90C3669574Ff2E40540f1c7b28a82cC7d7"

const ETH_SEPOLIA_CHAIN_ID = 11155111;
const ARB_SEPOLIA_CHAIN_ID = 421614;


// function getVaults():Promise<VaultData[]>{
//   const result: any[] = 
//     .map((vault: any) => {
//       const stratDesc = strategyDescriptions[vault.strategies[0]]
//       return {
//         address: vault.address,
//         vault: { ...vaultTokens[vault.address], balance: 0 },
//         asset: { ...assets[vault.assetAddress], balance: 0 },
//         chainId: vault.chainId,
//         fees: vault.fees,
//         metadata: {
//           vaultName: vault.name ? vault.name : undefined,
//           creator: vault.creator,
//           feeRecipient: vault.feeRecipient,
//           optionalMetadata: {
//             protocol: {
//               name: stratDesc.name,
//               description: stratDesc.description
//             },
//             resolver: stratDesc.resolver
//           },
//           labels: vault.labels ? vault.labels.map((label: string) => <VaultLabel>label) : undefined,
//           description: vault.description || undefined
//         }
//       }
//     })

//   const uniqueAssetAdresses: Address[] = []
//   result.forEach(vault => {
//     if (!uniqueAssetAdresses.includes(vault.asset.address)) {
//       uniqueAssetAdresses.push(vault.asset.address)
//     }
//   })

//   const { data: priceData } = await axios.get(`https://coins.llama.fi/prices/current/${String(uniqueAssetAdresses.map(
//     // @ts-ignore -- @dev ts still thinks entry.asset is just an `Address`
//     address => `${networkMap[chainId].toLowerCase()}:${address}`
//   ))}`)

//   const { data: beefyTokens } = await axios.get("https://api.beefy.finance/tokens")
//   const { data: beefyPrices } = await axios.get("https://api.beefy.finance/lps")

//   // Get vault addresses
//   const res1 = await client.multicall({
//     contracts: result.map((vault: any) => prepareVaultContract(vault.address, vault.asset.address, account)).flat(),
//     allowFailure: false
//   })

//   result.forEach((vault, i) => {
//     if (i > 0) i = i * 5
//     const totalAssets = Number(res1[i]);
//     const totalSupply = Number(res1[i + 1])
//     const assetsPerShare = totalSupply > 0 ? (totalAssets + 1) / (totalSupply + (1e9)) : Number(1e-9)

//     vault.totalAssets = totalAssets;
//     vault.totalSupply = totalSupply;
//     vault.assetsPerShare = assetsPerShare;
//     vault.depositLimit = Number(res1[i + 2]);

//     if (account !== zeroAddress) {
//       vault.vault.balance = Number(res1[i + 3]);
//       vault.asset.balance = Number(res1[i + 4]);
//     }

//     const key = `${networkMap[chainId].toLowerCase()}:${vault.asset.address}`
//     let assetPrice = Number(priceData.coins[key]?.price || 10)

//     if (assetPrice === 10 && client.chain.id === 10) {
//       const lpFound: any | undefined = Object.entries(beefyTokens["optimism"])
//         .map(entry => entry[1])
//         .find((token: any) => getAddress(token.address) === getAddress(vault.asset.address))

//       if (!lpFound) assetPrice = 1;
//       const beefyKey = Object.keys(beefyPrices).find(key => key === lpFound.oracleId)
//       // @ts-ignore
//       assetPrice = beefyPrices[beefyKey]
//     }

//     const pricePerShare = assetsPerShare * assetPrice

//     vault.assetPrice = assetPrice;
//     vault.pricePerShare = pricePerShare;
//     vault.tvl = (totalSupply * pricePerShare) / (10 ** vault.asset.decimals)
//     vault.vault.price = pricePerShare * 1e9; // @dev normalize vault price for previews (watch this if errors occur)
//     vault.asset.price = assetPrice;
//   })

//   // Add apy
//   await Promise.all(result.map(async (vault, i) => {
//     let apy = 0;
//     try {
//       const vaultYield = await yieldOptions.getApy({
//         chainId: vault.chainId,
//         protocol: vault.metadata.optionalMetadata.resolver as ProtocolName,
//         asset: vault.asset.address
//       })
//       apy = vaultYield.total
//     } catch (e) { }
//     vault.apy = apy
//     vault.totalApy = apy
//   }))

//   // Add gauges
//   if (client.chain.id === 1) {
//     const gauges = await getGauges({ address: GAUGE_CONTROLLER, account: account, publicClient: client })
//     const gaugeApyData = (await axios.get(`https://raw.githubusercontent.com/Popcorn-Limited/defi-db/main/gauge-apy-data.json`)).data as GaugeData;
//     await Promise.all(result.map(async (vault, i) => {
//       const foundGauge = gauges.find((gauge: Gauge) => gauge.lpToken === vault.address)
//       const gauge = foundGauge ? {
//         address: foundGauge.address,
//         name: `${vault.vault.name}-gauge`,
//         symbol: `st-${vault.vault.name}`,
//         decimals: foundGauge.decimals,
//         logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
//         balance: account === zeroAddress ? 0 : foundGauge.balance,
//         price: vault.pricePerShare * 1e9,
//       } : undefined

//       let gaugeMinApy;
//       let gaugeMaxApy;
//       let totalApy = vault.totalApy;

//       if (!!gauge) {
//         gaugeMinApy = gaugeApyData[gauge.address]?.lowerAPR || 0;
//         gaugeMaxApy = gaugeApyData[gauge.address]?.upperAPR || 0;
//         totalApy += gaugeMaxApy;
//       }

//       vault.gauge = gauge;
//       vault.totalApy = totalApy
//       vault.gaugeMinApy = gaugeMinApy
//       vault.gaugeMaxApy = gaugeMaxApy
//     }))
// }

function VePopContainer() {
  const { address: account } = useAccount()
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient()

  const { data: veBal } = useBalance({ chainId: SEPOLIA_CHAIN_ID, address: account, token: VOTING_ESCROW, watch: true })

  const [initalLoad, setInitalLoad] = useState<boolean>(false);
  const [accountLoad, setAccountLoad] = useState<boolean>(false);

  const [vaults, setVaults] = useState<VaultData[]>([])
  const [initialVotes, setInitialVotes] = useState<{ [key: Address]: number }>({});
  const [votes, setVotes] = useState<{ [key: Address]: number }>({});
  const [canCastVote, setCanCastVote] = useState<boolean>(false);
  const [canVoteOnGauges, setCanVoteOnGauges] = useState<boolean[]>([]);

  const [showLockModal, setShowLockModal] = useState(false);
  const [showMangementModal, setShowMangementModal] = useState(false);
  const [showOptionTokenModal, setShowOptionTokenModal] = useState(false);
  const [showLpModal, setShowLpModal] = useState(false);

  useEffect(() => {
    async function initialSetup() {
      setInitalLoad(true)
      if (account) setAccountLoad(true)

      const _vaults = getVaults()

      if (_vaults.length > 0 && Object.keys(votes).length === 0 && publicClient.chain.id === ETH_SEPOLIA_CHAIN_ID) {
        const initialVotes: { [key: Address]: number } = {}
        const voteUserSlopesData = await voteUserSlopes({
          gaugeAddresses: _vaults?.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient,
          account: account as Address
        });
        _vaults.forEach((vault, index) => {
          // @ts-ignore
          initialVotes[vault.gauge?.address] = Number(voteUserSlopesData[index].power)
        })
        setInitialVotes(initialVotes);
        setVotes(initialVotes);

        const { canCastVote, canVoteOnGauges } = await hasAlreadyVoted({
          addresses: _vaults.map((vault: VaultData) => vault.gauge?.address as Address),
          publicClient,
          account: account as Address
        })
        setCanVoteOnGauges(canVoteOnGauges);
        setCanCastVote(!!account && Number(veBal?.value) > 0 && canCastVote)
      }
    }
    if (!account && !initalLoad && vaults.length === 0) initialSetup();
    if (account && !accountLoad && !!veBal && vaults.length === 0) initialSetup()
  }, [account, initalLoad, accountLoad, vaults])

  function handleVotes(val: number, index: Address) {
    const updatedVotes = { ...votes };
    const updatedTotalVotes = Object.values(updatedVotes).reduce((a, b) => a + b, 0) - updatedVotes[index] + val;

    if (updatedTotalVotes <= 10000) {
      // TODO should we adjust the val to the max possible value if it exceeds 10000?
      updatedVotes[index] = val;
    }

    setVotes((prevVotes) => updatedVotes);
  }

  const [selectedNetworks, selectNetwork] = useNetworkFilter([1]);
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearch(value: string) {
    setSearchTerm(value)
  }

  return (
    <>
      <LockModal show={[showLockModal, setShowLockModal]} setShowLpModal={setShowLpModal} />
      <ManageLockModal show={[showMangementModal, setShowMangementModal]} setShowLpModal={setShowLpModal} />
      <OptionTokenModal show={[showOptionTokenModal, setShowOptionTokenModal]} />
      <LpModal show={[showLpModal, setShowLpModal]} />
      <div className="static">
        <section className="py-10 px-4 md:px-8 border-t md:border-t-0 md:border-b border-[#353945] lg:flex lg:flex-row items-center justify-between text-primary">
          <div className="lg:w-[1050px]">
            <h1 className="text-2xl md:text-3xl font-normal">
              Lock <span className="text-[#DFFF1C] font-bold md:font-normal md:underline md:decoration-solid">20WETH-80VCX</span> for veVCX, Rewards, and Voting Power
            </h1>
            <p className="text-base text-primary opacity-80 mt-4">
              Vote with your veVCX below to influence how much $oVCX each pool will receive.
            </p>
            <p className="text-base text-primary opacity-80">
              Your vote will persist until you change it and editing a pool can only be done once every 10 days.
            </p>
          </div>
        </section>

        <section className="pb-12 md:py-10 px-4 md:px-8 md:flex md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-8">
          <StakingInterface setShowLockModal={setShowLockModal} setShowMangementModal={setShowMangementModal} setShowLpModal={setShowLpModal} />
          <OptionTokenInterface
            gauges={vaults?.length > 0 ? vaults.filter(vault => !!vault.gauge?.address).map((vault: VaultData) => vault.gauge as Token) : []}
            setShowOptionTokenModal={setShowOptionTokenModal}
          />
        </section >

        <section className="my-10 px-4 md:px-8 md:flex flex-row items-center justify-between">
          <NetworkFilter supportedNetworks={[ETH_SEPOLIA_CHAIN_ID as ChainId]} selectNetwork={() => { }} />
          <div className="flex flex-row space-x-4">
            <SearchBar searchTerm={searchTerm} handleSearch={handleSearch} />
            <VaultsSorting className="" vaultState={[vaults, setVaults]} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8">
          {vaults?.length > 0 ?
            vaults.filter(vault => selectedNetworks.includes(vault.chainId))
              .filter(vault => !!vault.gauge?.address)
              .map((vault: VaultData, index: number) =>
                <Gauge
                  key={vault.address}
                  vaultData={vault}
                  index={vault.gauge?.address as Address}
                  votes={votes}
                  handleVotes={handleVotes}
                  canVote={canVoteOnGauges[index]}
                  searchTerm={searchTerm}
                />
              )
            : <p className="text-primary">Loading Gauges...</p>
          }
        </section>

        <div className="fixed left-0 bottom-10 w-full">

          <div className="z-10 mx-auto w-60 md:w-104 bg-[#23262F] px-6 py-4 rounded-lg flex flex-col md:flex-row items-center justify-between text-white border border-[#353945]">
            <p className="mt-1">
              Voting power used: <span className="font-bold">
                {
                  veBal && veBal.value && Object.keys(votes).length > 0
                    ? (Object.values(votes).reduce((a, b) => a + b, 0) / 100).toFixed(2)
                    : "0"
                }%
              </span>
            </p>
            <div className="mt-4 md:mt-0 w-40">
              <MainActionButton
                label="Cast Votes"
                disabled={!canCastVote}
                handleClick={() => sendVotes({
                  vaults,
                  votes,
                  prevVotes: initialVotes,
                  account: account as Address,
                  clients: { publicClient, walletClient: walletClient as WalletClient },
                  canVoteOnGauges
                })}
              />
            </div>
          </div>

        </div>

      </div>
    </>
  )
}

export default function VeVCX() {
  // @ts-ignore
  return <NoSSR><VePopContainer /></NoSSR>
}


const VAULTS = [
  {
    address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
    assetAddress: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
    chainId: ETH_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
      name: "VaultCraft mWETH",
      symbol: "vc-mWETH",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x299E99c253AE9f75fe3c6B7CC1b8D0ee28E8Ebe7",
      name: `MockETH-gauge`,
      symbol: `st-mETH`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ETH_SEPOLIA_CHAIN_ID
    },
    asset: {
      address: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
      name: "Mock ETH",
      symbol: "mETH",
      decimals: 18,
      logoURI: "https://metadata-service.herokuapp.com/api/token/1/0x83f20f44975d03b1b09e64809b757c47f942beea/icon",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
    assetAddress: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
    chainId: ETH_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
      name: "VaultCraft mDAI",
      symbol: "vc-mDAI",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x299E99c253AE9f75fe3c6B7CC1b8D0ee28E8Ebe7",
      name: `MockDai-gauge`,
      symbol: `st-mDAI`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ETH_SEPOLIA_CHAIN_ID

    },
    asset: {
      address: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
      name: "Mock DAI",
      symbol: "mDAI",
      decimals: 18,
      logoURI: "https://metadata-service.herokuapp.com/api/token/1/0x83f20f44975d03b1b09e64809b757c47f942beea/icon",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
    assetAddress: "0xD33275AEBc80a988c418B149598E693C4A203677",
    chainId: ETH_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
      name: "VaultCraft mUSDC",
      symbol: "vc-mUSDC",
      decimals: 15,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x299E99c253AE9f75fe3c6B7CC1b8D0ee28E8Ebe7",
      name: `MockUSDC-gauge`,
      symbol: `st-mUSDC`,
      decimals: 15,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ETH_SEPOLIA_CHAIN_ID

    },
    asset: {
      address: "0xD33275AEBc80a988c418B149598E693C4A203677",
      name: "Mock USDC",
      symbol: "mUSDC",
      decimals: 6,
      logoURI: "https://metadata-service.herokuapp.com/api/token/1/0x83f20f44975d03b1b09e64809b757c47f942beea/icon",
      chainId: ETH_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
    assetAddress: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
    chainId: ARB_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xd870dE4D952832de779eb770f7DfE6148064C9a7",
      name: "VaultCraft mWETH",
      symbol: "vc-mWETH",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x299E99c253AE9f75fe3c6B7CC1b8D0ee28E8Ebe7",
      name: `MockETH-gauge`,
      symbol: `st-mETH`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ARB_SEPOLIA_CHAIN_ID

    },
    asset: {
      address: "0xd75Ec05952E1102a1f543DdFf1bD444F056B44fF",
      name: "Mock ETH",
      symbol: "mETH",
      decimals: 18,
      logoURI: "https://metadata-service.herokuapp.com/api/token/1/0x83f20f44975d03b1b09e64809b757c47f942beea/icon",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
    assetAddress: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
    chainId: ARB_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xb65B1b9C0f432A2b66c8716dce76Fa60675aeBa6",
      name: "VaultCraft mDAI",
      symbol: "vc-mDAI",
      decimals: 27,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x299E99c253AE9f75fe3c6B7CC1b8D0ee28E8Ebe7",
      name: `MockDai-gauge`,
      symbol: `st-mDAI`,
      decimals: 27,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ARB_SEPOLIA_CHAIN_ID

    },
    asset: {
      address: "0xC7b43e61149E992067C4cfC2B0b9E24173c80241",
      name: "Mock DAI",
      symbol: "mDAI",
      decimals: 18,
      logoURI: "https://metadata-service.herokuapp.com/api/token/1/0x83f20f44975d03b1b09e64809b757c47f942beea/icon",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  },
  {
    address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
    assetAddress: "0xD33275AEBc80a988c418B149598E693C4A203677",
    chainId: ARB_SEPOLIA_CHAIN_ID,
    fees: {
      deposit: 0,
      withdrawal: 0,
      management: 0,
      performance: 0
    },
    type: "single-asset-vault-v1",
    description: "",
    creator: "0x22f5413C075Ccd56D575A54763831C4c27A37Bdb",
    strategies: ["0x27Da6422620A688619AaEf12BCc9C770C333A101"],
    vault: {
      address: "0xDc72227e13423971AB4a1566c3d307313eB7Ac8F",
      name: "VaultCraft mUSDC",
      symbol: "vc-mUSDC",
      decimals: 15,
      logoURI: "https://app.vaultcraft.io/images/tokens/vcx.svg",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
    gauge: {
      address: "0x299E99c253AE9f75fe3c6B7CC1b8D0ee28E8Ebe7",
      name: `MockUSDC-gauge`,
      symbol: `st-mUSDC`,
      decimals: 15,
      logoURI: "/images/tokens/vcx.svg",  // wont be used, just here for consistency
      balance: 0,
      price: 0,
      chainId: ARB_SEPOLIA_CHAIN_ID
    },
    asset: {
      address: "0xD33275AEBc80a988c418B149598E693C4A203677",
      name: "Mock USDC",
      symbol: "mUSDC",
      decimals: 6,
      logoURI: "https://metadata-service.herokuapp.com/api/token/1/0x83f20f44975d03b1b09e64809b757c47f942beea/icon",
      chainId: ARB_SEPOLIA_CHAIN_ID,
      balance: 0,
      price: 0,
    },
  }
]