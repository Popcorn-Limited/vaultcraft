import { readContract } from "@wagmi/core";
import { readContracts } from "wagmi";
import { BigNumber } from "ethers";

const CONTROLLER_ADDRESS = "0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD";

export async function balancer({ chainId }: { chainId: number }): Promise<string[]> {
    const n_gauges = await readContract({
        address: CONTROLLER_ADDRESS,
        abi: abiController,
        functionName: "n_gauges",
        chainId,
        args: []
    }) as BigNumber

    const gauges = await readContracts({
        contracts: Array(n_gauges.toNumber()).fill(undefined).map((item, idx) => {
            return {
                address: CONTROLLER_ADDRESS,
                abi: abiController,
                functionName: "gauges",
                chainId,
                args: [idx]
            }
        })
    }) as string[]

    const areGaugesKilled = await readContracts({
        contracts: gauges.map((gauge: any) => {
            return {
                address: gauge,
                abi: abiGauge,
                functionName: "is_killed",
                chainId,
                args: []
            }
        })
    }) as boolean[]

    const aliveGauges = gauges.filter((gauge: any, idx: number) => !areGaugesKilled[idx])

    const lpTokens = await readContracts({
        contracts: aliveGauges.map((gauge: any) => {
            return {
                address: gauge,
                abi: abiGauge,
                functionName: "lp_token",
                chainId,
                args: [],
            }
        })
    }) as (string | null)[]

    return lpTokens.filter(lpToken => !!lpToken) as string[]
}

const abiController = [
    {
        "stateMutability": "view",
        "type": "function",
        "name": "n_gauges",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "int128"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "gauges",
        "inputs": [
            {
                "name": "arg0",
                "type": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
]
const abiGauge = [
    {
        "stateMutability": "view",
        "type": "function",
        "name": "lp_token",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "stateMutability": "view",
        "type": "function",
        "name": "is_killed",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ]
    },
]