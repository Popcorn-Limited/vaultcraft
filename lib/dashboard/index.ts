import { AssetPushOracleAbi, AssetPushOracleByChain, BalancerOracleAbi, ExerciseByChain, ExerciseOracleByChain, OptionTokenByChain, OVCX_ORACLE, VCX, VcxByChain, WETH } from "@/lib/constants";
import { TokenByAddress } from "@/lib/types";
import { ChainById, GAUGE_NETWORKS, RPC_URLS, SUPPORTED_NETWORKS } from "@/lib/utils/connectors";
import { createPublicClient, erc20Abi, http, parseAbiItem, PublicClient, zeroAddress } from "viem";
import axios from "axios";
import { avalanche } from "viem/chains";

export default async function loadDashboardData(tokens: { [key: number]: TokenByAddress }) {
  const vcxData = await loadVCXData(tokens);
  const assetOracleData = await loadAssetOracleData();
  const automationData = await loadAutomationData();
  return { vcxData, assetOracleData, automationData }
}

async function loadVCXData(tokens: { [key: number]: TokenByAddress }) {
  const mainnetClient = createPublicClient({ chain: ChainById[1], transport: http(RPC_URLS[1]) })
  const minPrice = await mainnetClient.readContract({
    address: OVCX_ORACLE,
    abi: BalancerOracleAbi,
    functionName: "minPrice",
  });

  const vcxDataByChain: { [key: number]: any } = {}
  await Promise.all(
    GAUGE_NETWORKS.map(async (chain) => {
      vcxDataByChain[chain] = await loadVCXDataByChain(chain, mainnetClient, tokens, minPrice)
    })
  )
  return vcxDataByChain
}

async function loadVCXDataByChain(chainId: number, mainnetClient: PublicClient, tokens: { [key: number]: TokenByAddress }, minPrice: bigint) {
  const client = createPublicClient({ chain: ChainById[chainId], transport: http(RPC_URLS[chainId]) })

  const strikePriceRes = await client.readContract({
    address: ExerciseOracleByChain[chainId],
    abi: BalancerOracleAbi,
    functionName: "getPrice",
  });
  const vcxPrice = tokens[1][VCX].price
  const strikePrice = (Number(strikePriceRes) * tokens[1][WETH].price) / 1e18;
  const ovcxPrice = vcxPrice - strikePrice
  const discount = ((1 - (strikePrice / vcxPrice)) * 100)
  const minPriceInUsd = (Number(minPrice) * tokens[1][WETH].price) / 1e18;

  let oVCXInCirculation;
  let exercisableVCX;
  let lastUpdate;
  let lastBridge;
  if (chainId === 1) {
    const balanceRes = await client.multicall({
      contracts: [
        {
          address: OptionTokenByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [zeroAddress]
        },
        {
          address: VcxByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [ExerciseByChain[chainId]]
        }
      ],
      allowFailure: false
    })
    const bridgedOVCX = GAUGE_NETWORKS.filter(chain => chain !== chainId).reduce((amount, chain) => tokens[chain][OptionTokenByChain[chain]].totalSupply + amount, BigInt(0))
    oVCXInCirculation = tokens[chainId][OptionTokenByChain[chainId]].totalSupply - balanceRes[0] - bridgedOVCX
    exercisableVCX = balanceRes[1]

    const block = await client.getBlock()
    lastUpdate = block.timestamp
    lastBridge = 0
  } else {
    const balanceRes = await client.multicall({
      contracts: [
        {
          address: OptionTokenByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [ExerciseByChain[chainId]]
        },
        {
          address: VcxByChain[chainId],
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [ExerciseByChain[chainId]]
        }
      ],
      allowFailure: false
    })

    oVCXInCirculation = tokens[chainId][OptionTokenByChain[chainId]].totalSupply - balanceRes[0]
    exercisableVCX = balanceRes[1]

    const updateLogs = await client.getLogs({
      address: ExerciseOracleByChain[chainId],
      event: parseAbiItem("event PriceUpdate(uint oldPrice, uint newPrice)"),
      fromBlock: "earliest",
      toBlock: "latest",
    });
    const block = await client.getBlock({ blockNumber: updateLogs[updateLogs.length - 1].blockNumber })
    lastUpdate = block.timestamp

    let bridgeLogs: any[] = []
    if (chainId === 10) {
      bridgeLogs = await mainnetClient.getLogs({
        address: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
        event: parseAbiItem("event ERC20BridgeInitiated(address indexed localToken, address indexed remoteToken, address indexed from, address to, uint256 amount, bytes extraData)"),
        fromBlock: "earliest",
        toBlock: "latest",
        args: {
          localToken: OptionTokenByChain[1]
        }
      });
    } else if (chainId === 42161) {
      bridgeLogs = await mainnetClient.getLogs({
        address: "0x72Ce9c846789fdB6fC1f34aC4AD25Dd9ef7031ef",
        event: parseAbiItem("event TransferRouted(address indexed token, address indexed _userFrom, address indexed _userTo, address gateway)"),
        fromBlock: "earliest",
        toBlock: "latest",
        args: {
          token: OptionTokenByChain[1]
        }
      });
    }
    const bridgeBlock = await mainnetClient.getBlock({ blockNumber: bridgeLogs[bridgeLogs.length - 1].blockNumber })
    lastBridge = bridgeBlock.timestamp
  }

  return { oVCXInCirculation, exercisableVCX, vcxPrice, strikePrice, minPrice: minPriceInUsd, ovcxPrice, discount, lastUpdate, lastBridge }
}

async function loadAssetOracleData() {
  const chains = Object.keys(AssetPushOracleByChain).filter(chain => AssetPushOracleByChain[Number(chain)] !== zeroAddress).map(chain => Number(chain))

  const assetOracleData: { [key: number]: any } = {}
  await Promise.all(
    chains.map(async (chain) => {
      assetOracleData[chain] = chain === avalanche.id ? [] : await loadAssetOracleDataByChain(chain)
    })
  )
  return assetOracleData
}

async function loadAssetOracleDataByChain(chainId: number) {
  const client = createPublicClient({ chain: ChainById[chainId], transport: http(RPC_URLS[chainId]) })

  const logs = await client.getLogs({
    address: AssetPushOracleByChain[chainId],
    event: AssetPushOracleAbi[6],
    fromBlock: "earliest",
    toBlock: "latest"
  });

  // Get unique base-quote pairs
  let uniqueKeys: string[] = []
  logs.forEach(log => {
    if (!uniqueKeys.includes(String(log.args.base! + log.args.quote!))) {
      uniqueKeys.push(String(log.args.base! + log.args.quote!));
    }
  })

  // Find the latest event of each base-quote pair
  const latestLogs = uniqueKeys.map(key => logs.findLast(log => String(log.args.base! + log.args.quote!) === key))

  let result: any[] = []
  await Promise.all(
    latestLogs.map(async (log: any) => {
      const block = await client.getBlock({ blockNumber: log.blockNumber! })
      result.push({ lastUpdate: block.timestamp, log })
    })
  )
  return result
}

async function loadAutomationData() {
  const mainnetClient = createPublicClient({ chain: ChainById[1], transport: http(RPC_URLS[1]) })

  // load 1Balance
  const { data } = await axios.get("https://api.gelato.digital/1balance/networks/mainnets/sponsors/0x2C3B135cd7dc6C673b358BEF214843DAb3464278")

  // load tradebot balances
  const tradeBotEth = await mainnetClient.getBalance({ address: '0x09524570563410FB8aD422e6A2482205b6996F6E' })
  const tradeBotWeth = await mainnetClient.readContract({
    address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: ['0x09524570563410FB8aD422e6A2482205b6996F6E']
  })

  return { gelatoBalance: Number(data.sponsor.balances.remainingBalance) / 1e6, tradebot: { eth: tradeBotEth, weth: tradeBotWeth } }
}