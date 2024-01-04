// @ts-ignore
import NoSSR from "react-no-ssr";
import axios from "axios";
import { differenceInCalendarWeeks } from "date-fns";

// import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import SelectField from "@/components/input/SelectField";
import { erc20ABI, usePublicClient } from "wagmi";
import { getVeAddresses } from "@/lib/utils/addresses";
import { BalancerVaultAbi, VCX_POOL_ID, VotingEscrowAbi } from "@/lib/constants";
import {formatToFixedDecimals} from "@/lib/utils/formatBigNumber";
import {bigint} from "zod";

const { VCX, VotingEscrow, WETH, WETH_VCX_LP, oVCX, BalancerVault } = getVeAddresses()

type DuneQueryResult<T> = {
    result: {
        rows: T[]
    }
}

const vaultTvlChartColors = [
    "#FFE650",
    "#9B55FF",
    "#FFFFFF",
    "#7AFB79",
    "#627EEA",
    "#001911",
    "#FA5A6E",
]

const chainOptions = [
    // {
    //     image: 'https://cdn.furucombo.app/assets/img/token/MATIC.png',
    //     label: 'Polygon'
    // },
    {
        image: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
        label: 'Ethereum'
    },
    // {
    //     image: 'https://cdn.furucombo.app/assets/img/token/ARB.svg',
    //     label: 'Arbitrum'
    // },
    // {
    //     image: 'https://cdn.furucombo.app/assets/img/token/BTC.svg',
    //     label: 'Binance'
    // }
]

const leaderboardOptions = [{
    label: 'Top Stakers'
}, {
    label: 'Top Depositors'
}]

const totalEmission = () => {
    let totalEmission = 0;
    let today = new Date();

    const epochDiff = differenceInCalendarWeeks(
      new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
      new Date(2023, 11, 30)
    )

    if (epochDiff <= 13) {
        totalEmission += epochDiff * 2000000;
    } else {
        const emission = 2000000 * Math.pow(0.9729, epochDiff - 13);
        totalEmission += 13 * 2000000 + emission
    }

    return totalEmission;
}

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)

    const year = date.getFullYear()
    const month = date.toLocaleString('default', { month: 'short' })
    const day = date.getDate()

    return `${month}. ${day} ${year}`
}

export default function Vaults() {
    const publicClient = usePublicClient({ chainId: 1 })
    const [statistics, setStatistics] = useState<{
        totalSupply: number
        liquidSupply: number
        fdv: number
        marketCap: number
        vcxPrice: number
        vcxInBalPool: number
        wethInBalPool: number
        balLp: number
        veVcx: number
        oVcxEmissions: number
        oVcxExercised: number
        networkId: number
        vaultTvl: {
            title: string
            count: number
        }[]
        tvlMonthByMonth: {
            date: number
            tokens: {
                [key: string]: number
            }
        }[]
        totalRevenue: number
        oVcxRevenue: number
        burnedVcx: number
        weekDexVolume: number
        holderTotal: number
        holderPlankton: number
        holderShrimp: number
        holderFish: number
        holderDolphin: number
        holderWhale: number
        tvl: number
        snapshotPips: {
            created: number
            title: string
        }[]
        leaderboard: {
            address: string
            count: number
        }[]
    }>({
        totalSupply: 0,
        liquidSupply: 0,
        fdv: 0,
        marketCap: 0,
        vcxPrice: 0,
        vcxInBalPool: 0,
        wethInBalPool: 0,
        balLp: 0,
        veVcx: 0,
        oVcxEmissions: 0,
        oVcxExercised: 0,
        networkId: 0,
        vaultTvl: [],
        tvlMonthByMonth: [],
        totalRevenue: 0,
        oVcxRevenue: 0,
        burnedVcx: 0,
        weekDexVolume: 0,
        holderTotal: 0,
        holderPlankton: 0,
        holderShrimp: 0,
        holderFish: 0,
        holderDolphin: 0,
        holderWhale: 0,
        tvl: 0,
        snapshotPips: [],
        leaderboard: [],
    });
    const [tvlChain, setTvlChain] = useState<{
        image?: string
        label: string
    }>(chainOptions[0])
    const [leaderboardOption, setleaderboardOption] = useState(leaderboardOptions[1])

    const liquidVcxMarketChartElem = useRef(null);
    const vaultTvlChartElem = useRef(null);
    const TVLOverTimeChartElem = useRef(null);

    function initDonutChart(elem: null | HTMLElement, data: {
        y: number
        name: string
        color: string
    }[]) {
        if (!elem) return

        Highcharts.chart(
            elem,
            {
                chart: {
                    type: 'pie',
                    width: 152,
                    height: 152,
                    backgroundColor: 'transparent',
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        innerSize: '90%',
                        borderWidth: 6,
                        shadow: false,
                        borderColor: undefined,
                        dataLabels: {
                            enabled: false
                        }
                    },
                    series: {
                        animation: {
                            duration: 750,
                            easing: 'easeOutQuad',
                        },
                    },

                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    valueSuffix: '%',
                    formatter: function () {
                        return `${this.key}: ${this.y?.toLocaleString()}`;
                    }
                },
                title: {
                    text: ''
                },
                series: [{
                    data,
                    type: 'pie'
                }]
            },
        );
    }

    function initLineChart(elem: null | HTMLElement, data: {
        x: number
        y: number
    }[]) {
        if (!elem) return

        Highcharts.chart(
            elem,
            {
                chart: {
                    // @ts-ignore
                    zoomType: 'xy',
                    type: 'line',
                    backgroundColor: 'transparent',
                    height: 325,
                },
                credits: {
                    enabled: false,
                },
                title: {
                    text: '',
                },
                yAxis: {
                    gridLineColor: 'transparent',
                    title: {
                        text: '',
                    },
                    labels: {
                        style: {
                            color: '#fff'
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    lineWidth: 0,
                    tickColor: 'transparent',
                    labels: {
                        style: {
                            color: '#fff'
                        }
                    },
                    dateTimeLabelFormats: {
                        month: "%Y-%m",
                    }
                },
                legend: {
                    enabled: false,
                },
                tooltip: {
                    formatter: function () {
                        return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.y as number);
                    },
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false,
                            fillColor: '#7AFB79',
                            lineColor: '#7AFB79',
                            lineWidth: 1,
                        },
                        states: {
                            hover: {
                                enabled: true,
                                halo: {
                                    size: 0,
                                },
                            },
                        },
                        pointStart: 1,
                    },
                },
                series: [
                    {
                        data,
                        type: 'area',
                        color: '#7AFB79',
                        fillColor: '#001911',
                    },
                ],
            },
            () => ({})
        )
    }

    async function init() {
        const duneOpts = {
            headers: {
                'x-dune-api-key': process.env.DUNE_API_KEY
            }
        }

        const [
            snapshotPips,
            duneTokenResult,
            prices,
            poolTokens,
            tvlByTime,
            holder,
            veLocked,
            volume,
            oVCXRevenue,
        ] = await Promise.all([
            axios.get<DuneQueryResult<{
                created: number
                title: string
            }>>('https://api.dune.com/api/v1/query/2548926/results', duneOpts),
            axios.get<DuneQueryResult<{
                totalsupply: number
                totalburn: number
                cumulativeexercisedvcx: number
                circulatingsupply: number
            }>>('https://api.dune.com/api/v1/query/3238349/results', duneOpts),
            axios.get(`https://coins.llama.fi/prices/current/ethereum:0xcE246eEa10988C495B4A90a905Ee9237a0f91543,ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,ethereum:0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920`),
            publicClient.readContract({
                address: BalancerVault,
                abi: BalancerVaultAbi,
                functionName: "getPoolTokens",
                args: [VCX_POOL_ID]
            }),
            axios.get<{
                tokensInUsd: {
                    date: number
                    tokens: {
                        [key: string]: number
                    }
                }[]
            }>('https://api.llama.fi/protocol/vaultcraft'),
            axios.get<DuneQueryResult<{
                summary_type: string
                whales_balance: number
                whales_number: number
                dolphins_balance: number
                dolphins_number: number
                fish_balance: number
                fish_number: number
                shrimps_balance: number
                shrimps_number: number
                plankton_balance: number
                plankton_number: number
                total_balance: number
                total_number: number
            }>>('https://api.dune.com/api/v1/query/3237039/results', duneOpts),
            publicClient.readContract({
                address: VotingEscrow,
                abi: VotingEscrowAbi,
                functionName: "supply"
            }),
            axios.get<DuneQueryResult<{
                'USD Volume': number
                blockchain: string
            }>>('https://api.dune.com/api/v1/query/2490697/results', duneOpts),
            axios.get<DuneQueryResult<{
                'cumulative_eth_redeemed': number
            }>>('https://api.dune.com/api/v1/query/3237707/results', duneOpts),
        ])

        const vcxInUsd = prices.data.coins["ethereum:0xcE246eEa10988C495B4A90a905Ee9237a0f91543"].price
        const wethInUsd = prices.data.coins["ethereum:0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"].price
        const lpInUsd = prices.data.coins["ethereum:0x577A7f7EE659Aa14Dc16FD384B3F8078E23F1920"].price
        const tvlByTokens = Object.keys(tvlByTime.data.tokensInUsd.slice(-1)[0].tokens)

        setStatistics({
            ...statistics,
            fdv: duneTokenResult.data.result.rows[0].totalsupply * vcxInUsd,
            totalSupply: duneTokenResult.data.result.rows[0].totalsupply,
            vcxPrice: vcxInUsd,
            burnedVcx: duneTokenResult.data.result.rows[0].totalburn,
            liquidSupply: duneTokenResult.data.result.rows[0].circulatingsupply,
            marketCap: duneTokenResult.data.result.rows[0].circulatingsupply * vcxInUsd,
            holderTotal: holder.data.result.rows[0].total_number,
            holderPlankton: holder.data.result.rows[0].plankton_number,
            holderShrimp: holder.data.result.rows[0].shrimps_number,
            holderFish: holder.data.result.rows[0].fish_number,
            holderDolphin: holder.data.result.rows[0].dolphins_number,
            holderWhale: holder.data.result.rows[0].whales_number,
            snapshotPips: snapshotPips.data.result.rows,
            weekDexVolume: volume.data.result.rows[0]['USD Volume'],
            tvlMonthByMonth: tvlByTime.data.tokensInUsd,
            tvl: tvlByTokens.reduce((acc, key) => acc + tvlByTime.data.tokensInUsd.slice(-1)[0].tokens[key], 0),
            vaultTvl: tvlByTokens.map(item => {
                return {
                    title: item,
                    count: tvlByTime.data.tokensInUsd.slice(-1)[0].tokens[item]
                }
            }),
            balLp: ((Number(poolTokens[1][1]) / 1e18) * vcxInUsd) + ((Number(poolTokens[1][0]) / 1e18) * wethInUsd),
            vcxInBalPool: (Number(poolTokens[1][1]) / 1e18) * vcxInUsd,
            wethInBalPool: (Number(poolTokens[1][0]) / 1e18) * wethInUsd,
            veVcx: (Number(veLocked) / 1e18) * lpInUsd,
            oVcxExercised: duneTokenResult.data.result.rows[0].cumulativeexercisedvcx,
            totalRevenue: Number(oVCXRevenue.data.result.rows[0].cumulative_eth_redeemed) * wethInUsd,
            oVcxRevenue: Number(oVCXRevenue.data.result.rows[0].cumulative_eth_redeemed) * wethInUsd,
            oVcxEmissions: totalEmission() * vcxInUsd * 0.25
        })

        initDonutChart(liquidVcxMarketChartElem.current,
            [
                {
                    name: "WETH in 80/20 BAL pool, USD",
                    y: (Number(poolTokens[1][0]) / 1e18) * wethInUsd,
                    color: "#9B55FF"
                },
                {
                    name: "VCX in 80/20 BAL pool, USD",
                    y: (Number(poolTokens[1][1]) / 1e18) * vcxInUsd,
                    color: "#7AFB79"
                },
            ]
        )
        initDonutChart(vaultTvlChartElem.current, tvlByTokens.map((item, idx) => {
            return {
                name: item,
                y: tvlByTime.data.tokensInUsd.slice(-1)[0].tokens[item],
                color: vaultTvlChartColors[idx % vaultTvlChartColors.length]
            }
        }))
        initLineChart(TVLOverTimeChartElem.current, tvlByTime.data.tokensInUsd.map(item => {
            return {
                x: item.date * 1000,
                y: Object.keys(item.tokens).reduce((acc, key) => acc + item.tokens[key], 0),
            }
        }))
    }

    useEffect(() => {
        init()

        function resizeHandler() {
            initLineChart(TVLOverTimeChartElem.current, statistics.tvlMonthByMonth.map(item => {
                return {
                    x: item.date * 1000,
                    y: Object.keys(item.tokens).reduce((acc, key) => acc + item.tokens[key], 0),
                }
            }))
        }

        window.addEventListener('resize', resizeHandler)
    }, [])

    return (
        <NoSSR>
            <div className={`text-white px-4 md:px-8`}>
                <h1 className={`font-bold text-[2rem]`}>VaultCraft Statistics</h1>
                <p className={`text-[1.125rem] mb-8`}>Total Stats start from 30 November 2023</p>
                <div className={`grid md:grid-cols-2 gap-[2rem]`}>
                    <div className={`border border-[#353945] rounded-[1rem] bg-[#23262f] p-6 grid col-span-full md:grid-cols-6 gap-6`}>
                        <div className={`flex flex-col`}>
                            <p className={`text-[1rem]`}>Total Supply</p>
                            <h2 className={`text-[1.5rem] md:text-[1rem] lg:text-[1.25rem] xl:text-[1.5rem] font-bold`}>{ formatToFixedDecimals(statistics.totalSupply, 0) }</h2>
                        </div>
                        <div className={`flex flex-col`}>
                            <p className={`text-[1rem]`}>Liquid Supply</p>
                            <h2 className={`text-[1.5rem] md:text-[1rem] lg:text-[1.25rem] xl:text-[1.5rem] font-bold`}>{ formatToFixedDecimals(statistics.liquidSupply, 0) }</h2>
                        </div>
                        <div className={`flex flex-col`}>
                            <p className={`text-[1rem]`}>FDV</p>
                            <h2 className={`text-[1.5rem] md:text-[1rem] lg:text-[1.25rem] xl:text-[1.5rem] font-bold`}>${ formatToFixedDecimals(statistics.fdv, 0) }</h2>
                        </div>
                        <div className={`flex flex-col`}>
                            <p className={`text-[1rem]`}>Market Cap</p>
                            <h2 className={`text-[1.5rem] md:text-[1rem] lg:text-[1.25rem] xl:text-[1.5rem] font-bold`}>${ formatToFixedDecimals(statistics.marketCap, 0) }</h2>
                        </div>
                        <div className={`flex flex-col`}>
                            <p className={`text-[1rem]`}>VCX Price</p>
                            <h2 className={`text-[1.5rem] md:text-[1rem] lg:text-[1.25rem] xl:text-[1.5rem] font-bold`}>${ statistics.vcxPrice.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 2 })}</h2>
                        </div>
                        <div className={`flex flex-col`}>
                            <p className={`text-[1rem]`}>Burned VCX</p>
                            <h2 className={`text-[1.5rem] md:text-[1rem] lg:text-[1.25rem] xl:text-[1.5rem] font-bold`}>{ formatToFixedDecimals(statistics.burnedVcx, 0) } VCX</h2>
                        </div>
                    </div>
                    <div className={`flex flex-col border border-[#353945] rounded-[1rem] bg-[#23262f]`}>
                        <div className={`h-[4rem] flex gap-2 border-b border-[#353945] px-[1.5rem]`}>
                            <img src="/images/icons/popLogo.svg" alt="Logo" className={`w-8 h-8 self-center`} />
                            <div className={`flex flex-col justify-center`}>
                                <p className={`text-[1rem]`}>VCX</p>
                                <p className={`text-[0.625rem]`}>Liquid VCX market (Mainnet only)</p>
                            </div>
                        </div>
                        <div className={`py-4 px-6 flex flex-col md:flex-row gap-[3.5rem]`}>
                            <div className={`flex flex-col grow-[1]`}>
                                <div className={`flex justify-between`}>
                                    <p>VCX in 80/20 BAL pool</p>
                                    <p className={`font-bold text-right`}>${ formatToFixedDecimals(statistics.vcxInBalPool, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>WETH in 80/20 BAL pool</p>
                                    <p className={`font-bold text-right`}>${ formatToFixedDecimals(statistics.wethInBalPool, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>BAL LPs</p>
                                    <p className={`font-bold text-right`}>${ formatToFixedDecimals(statistics.balLp, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>veVCX (staked LPs)</p>
                                    <p className={`font-bold text-right`}>${ formatToFixedDecimals(statistics.veVcx, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>oVCX emissions</p>
                                    <p className={`font-bold text-right`}>${ formatToFixedDecimals(statistics.oVcxEmissions, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>oVCX exercised</p>
                                    <p className={`font-bold text-right`}>{ formatToFixedDecimals(statistics.oVcxExercised, 0)} VCX</p>
                                </div>
                            </div>
                            <div className={`flex justify-center`} ref={liquidVcxMarketChartElem} />
                        </div>
                    </div>
                    <div className={`flex flex-col border border-[#353945] rounded-[1rem] bg-[#23262f]`}>
                        <div className={`h-[4rem] flex justify-between border-b border-[#353945] px-[1.5rem]`}>
                            <p className={`text-[0.75rem] sm:text-[1rem] my-auto`}>Smart Vault TVL</p>
                            <SelectField value={tvlChain} options={chainOptions} onChange={opt => setTvlChain(opt)} />
                        </div>
                        <div className={`py-4 px-6 flex flex-col md:flex-row gap-[3.5rem]`}>
                            <div className={`flex flex-col justify-between grow-[1]`}>
                                {[...statistics.vaultTvl].sort((a, b) => b.count - a.count).splice(0, 6).map((item, idx) => {
                                    return (
                                        <div key={idx} className={`flex justify-between`}>
                                            <p>{item.title}</p>
                                            <p className={`font-bold text-right`}>${formatToFixedDecimals(item.count, 0)}</p>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className={`flex justify-center`} ref={vaultTvlChartElem} />
                        </div>
                    </div>
                    <div className={`flex flex-col border border-[#353945] rounded-[1rem] bg-[#23262f]`}>
                        <div className={`h-[4rem] flex gap-2 border-b border-[#353945] px-[1.5rem]`}>
                            <p className={`text-[1rem] my-auto`}>Total Stats</p>
                        </div>
                        <div className={`py-4 px-6 flex gap-[3.5rem]`}>
                            <div className={`flex flex-col grow-[1]`}>
                                <div className={`flex justify-between`}>
                                    <p>Total Revenue</p>
                                    <p className={`font-bold text-right`}>${ formatToFixedDecimals(statistics.totalRevenue, 0)}</p>
                                </div>
                                {/*<div className={`flex justify-between`}>
                                    <p>Smart Vault Fees</p>
                                    <p className={`font-bold text-right`}>Coming Soon</p>
                                </div>*/}
                                {/*<div className={`flex justify-between`}>*/}
                                {/*    <p>oVCX Revenue</p>*/}
                                {/*    <p className={`font-bold text-right`}>${statistics.oVcxRevenue.toLocaleString()}</p>*/}
                                {/*</div>*/}
                                <div className={`flex justify-between`}>
                                    <p>7 Day Dex Volume</p>
                                    <p className={`font-bold text-right`}>${formatToFixedDecimals(statistics.weekDexVolume, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>Total Holder</p>
                                    <p className={`font-bold text-right`}>{formatToFixedDecimals(statistics.holderTotal, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>Wallets with 100-1K VCX</p>
                                    <p className={`font-bold text-right`}>{formatToFixedDecimals(statistics.holderPlankton, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>Wallets with 1K - 100K VCX</p>
                                    <p className={`font-bold text-right`}>{formatToFixedDecimals(statistics.holderShrimp, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>Wallets with 100K-1M VCX</p>
                                    <p className={`font-bold text-right`}>{formatToFixedDecimals(statistics.holderFish, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>Wallets with 1M-10M VCX</p>
                                    <p className={`font-bold text-right`}>{formatToFixedDecimals(statistics.holderDolphin, 0)}</p>
                                </div>
                                <div className={`flex justify-between`}>
                                    <p>Wallets with 10M+ VCX</p>
                                    <p className={`font-bold text-right`}>{formatToFixedDecimals(statistics.holderWhale, 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`flex flex-col border border-[#353945] rounded-[1rem] bg-[#23262f]`}>
                        <div className={`h-[4rem] flex gap-2 border-b border-[#353945] px-[1.5rem]`}>
                            <span className={`flex flex-col my-auto`}>
                                <p className={`text-[0.75rem]`}>Total Value locked</p>
                                <p className={`text-[1.5rem] leading-none font-bold`}>
                                    ${Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(statistics.tvl)}
                                </p>
                            </span>
                        </div>
                        <div className={`py-4 px-6`}>
                            <div ref={TVLOverTimeChartElem} />
                        </div>
                    </div>
                    <div className={`col-span-full grid md:grid-cols-1 gap-2`}>
                        <h2 className={`text-[1.5rem] font-bold`}>{'Snapshot PIP\'s'}</h2>
                        <div className={`flex flex-col border border-[#353945] rounded-[1rem] bg-[#23262f]`}>
                            <div className={`min-h-[4rem] max-h-[4rem] grid grid-cols-[2.5rem_1fr] gap-[1rem] md:grid-cols-[2.5rem_1fr_1fr_3rem] content-center border-b border-[#353945] px-[1.5rem]`}>
                                <span>#</span>
                                <span>Title</span>
                                <span className={`hidden md:block`}>Date</span>
                            </div>
                            <div className={`py-4 px-6 flex flex-col gap-4 max-h-[30rem] overflow-auto`}>
                                {statistics.snapshotPips.map((item, idx) => {
                                    return (
                                        <div key={idx} className={`grid grid-cols-[2.5rem_1fr] md:grid-cols-[2.5rem_1fr_1fr_3rem] gap-[1rem]`}>
                                            <span>{idx + 1}</span>
                                            <span>{item.title}</span>
                                            <span className={`hidden md:block`}>{formatDate(item.created * 1000)}</span>
                                            <a className={`hidden md:block`} href="https://snapshot.org/#/popcorn-snapshot.eth">Link</a>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </NoSSR>
    )
}
