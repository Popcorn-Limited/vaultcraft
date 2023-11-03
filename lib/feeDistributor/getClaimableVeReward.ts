import { Chain, createPublicClient, http } from 'viem';
import { thisPeriodTimestamp } from '@/lib/gauges/utils';
import { ZERO } from '@/lib/constants';
import { RPC_URLS } from '@/lib/utils/connectors';

interface GetVeRewardsProps {
  chain: Chain;
  address: `0x${string}`;
  user: `0x${string}`;
  token: `0x${string}`;
};

export default async function getClaimableVeReward({ chain, address, user, token }: GetVeRewardsProps): Promise<bigint> {
  const timestamp = BigInt(String(thisPeriodTimestamp()));

  const client = createPublicClient({ chain, transport: http(RPC_URLS[chain.id]) })
  const data = await client.multicall({
    contracts: [
      {
        address,
        abi: abiFeeDistributor,
        functionName: "getTotalSupplyAtTimestamp",
        args: [timestamp]
      },
      {
        address,
        abi: abiFeeDistributor,
        functionName: "getUserBalanceAtTimestamp",
        args: [user, timestamp]
      },
      {
        address,
        abi: abiFeeDistributor,
        functionName: "getTokensDistributedInWeek",
        args: [token, timestamp]
      },
    ],
    allowFailure: false
  })

  if (Number(data[1]) && Number(data[2]) > 0 && Number(data[0]) > 0) {
    return (data[1] * data[2]) / data[0];
  }

  return ZERO;
}

const abiFeeDistributor = [
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getTokensDistributedInWeek",
    "inputs": [
      {
        "name": "token",
        "type": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getTotalSupplyAtTimestamp",
    "inputs": [
      {
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "stateMutability": "view",
    "type": "function",
    "name": "getUserBalanceAtTimestamp",
    "inputs": [
      {
        "name": "user",
        "type": "address"
      },
      {
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ]
  },
] as const