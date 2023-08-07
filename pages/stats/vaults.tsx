import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import axios from "axios";

import SelectField from "@/components/inputs/SelectField";

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

const chainOptions = [{
    image: 'https://cdn.furucombo.app/assets/img/token/MATIC.png',
    label: 'Polygon'
}, {
    image: 'https://cdn.furucombo.app/assets/img/token/ETH.png',
    label: 'Ethereum'
}, {
    image: 'https://cdn.furucombo.app/assets/img/token/ARB.svg',
    label: 'Arbitrium'
}, {
    image: 'https://cdn.furucombo.app/assets/img/token/BTC.svg',
    label: 'Binance'
}]

const leaderboardOptions = [{
    label: 'Top Stakers'
}, {
    label: 'Top Depositors'
}]

const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)

    const year = date.getFullYear()
    const month = date.toLocaleString('default', { month: 'short' })
    const day = date.getDate()

    return `${month}. ${day} ${year}`
}

export default function Vaults() {
    const [statistics, setStatistics] = useState<{
        totalSupply: number
        liquidSupply: number
        fdv: number
        marketCap: number
        popPrice: number
        popInBalPool: number
        wethInBalPool: number
        balLp: number
        vePop: number
        cPopEmissions: number
        cPopExercised: number
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
        cPopRevenue: number
        publicGoodFunding: number
        weekCexVolume: number
        weekDexVolume: number
        walletsPopMoreZero: number
        walletsPopMoreHundred: number
        walletsPopMoreThousand: number
        walletsPopMoreHundredThousand: number
        walletsPopMoreMillion: number
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
        popPrice: 0,
        popInBalPool: 0,
        wethInBalPool: 0,
        balLp: 0,
        vePop: 0,
        cPopEmissions: 0,
        cPopExercised: 0,
        networkId: 0,
        vaultTvl: [],
        tvlMonthByMonth: [],
        totalRevenue: 0,
        cPopRevenue: 0,
        publicGoodFunding: 0,
        weekCexVolume: 0,
        weekDexVolume: 0,
        walletsPopMoreZero: 0,
        walletsPopMoreHundred: 0,
        walletsPopMoreThousand: 0,
        walletsPopMoreHundredThousand: 0,
        walletsPopMoreMillion: 0,
        tvl: 0,
        snapshotPips: [],
        leaderboard: [],
    });
    const [tvlChain, setTvlChain] = useState<{
        image?: string
        label: string
    }>(chainOptions[1])
    const [leaderboardOption, setleaderboardOption] = useState(leaderboardOptions[1])

    const liquidPopMarketChartElem = useRef(null);
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
                    formatter: function() {
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
                            color: 'white'
                        }
                    }
                },
                xAxis: {
                    type: 'datetime',
                    lineWidth: 0,
                    tickColor: 'transparent',
                    labels: {
                        style: {
                            color: 'white'
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
                    formatter: function() {
                        return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.y as number);
                    },
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false,
                            fillColor: '#001911',
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

        const mexcOpts = {
            headers: {
                'X-MEXC-APIKEY': process.env.MEXC_API_KEY,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            }
        }

        const [
            duneTokenResult,
            duneHoldersWithPop,
            duneHoldersWithPopMoreHundred,
            duneHoldersWithPopMoreThousand,
            duneHoldersWithPopMoreHundredThousand,
            duneHoldersWithPopMoreMillion,
            snapshotPips,
            duneDexVolume,
            tvlByTime,
        ] = await Promise.all([
            axios.get<DuneQueryResult<{
                FDV: number
                TotalSupply: number
                price: number
                CirculatingSupply: number
                MarketCap: number
            }>>('https://api.dune.com/api/v1/query/2521095/results', duneOpts),
            axios.get<DuneQueryResult<{
                total_holders: number
            }>>('https://api.dune.com/api/v1/query/2490604/results', duneOpts),
            axios.get<DuneQueryResult<{
                total_holders: number
            }>>('https://api.dune.com/api/v1/query/2490577/results', duneOpts),
            axios.get<DuneQueryResult<{
                total_holders: number
            }>>('https://api.dune.com/api/v1/query/2490615/results', duneOpts),
            axios.get<DuneQueryResult<{
                total_holders: number
            }>>('https://api.dune.com/api/v1/query/2490624/results', duneOpts),
            axios.get<DuneQueryResult<{
                total_holders: number
            }>>('https://api.dune.com/api/v1/query/2490650/results', duneOpts),
            axios.get<DuneQueryResult<{
                created: number
                title: string
            }>>('https://api.dune.com/api/v1/query/2548926/results', duneOpts),
            axios.get<DuneQueryResult<{
                'USD Volume': number
                blockchain: string
            }>>('https://api.dune.com/api/v1/query/2490697/results', duneOpts),
            axios.get<{
                tokensInUsd: {
                    date: number
                    tokens: {
                        [key: string]: number
                    }
                }[]
            }>('https://api.llama.fi/protocol/popcorn')
        ])

        setStatistics({
            ...statistics,
            fdv: duneTokenResult.data.result.rows[0].FDV,
            totalSupply: duneTokenResult.data.result.rows[0].TotalSupply,
            popPrice: duneTokenResult.data.result.rows[0].price,
            liquidSupply: duneTokenResult.data.result.rows[0].CirculatingSupply,
            marketCap: duneTokenResult.data.result.rows[0].MarketCap,
            walletsPopMoreZero: duneHoldersWithPop.data.result.rows[0].total_holders,
            walletsPopMoreHundred: duneHoldersWithPopMoreHundred.data.result.rows[0].total_holders,
            walletsPopMoreThousand: duneHoldersWithPopMoreThousand.data.result.rows[0].total_holders,
            walletsPopMoreHundredThousand: duneHoldersWithPopMoreHundredThousand.data.result.rows[0].total_holders,
            walletsPopMoreMillion: duneHoldersWithPopMoreMillion.data.result.rows[0].total_holders,
            snapshotPips: snapshotPips.data.result.rows,
            weekDexVolume: duneDexVolume.data.result.rows.reduce((acc, item) => acc + item['USD Volume'], 0),
            tvlMonthByMonth: tvlByTime.data.tokensInUsd,
            tvl: Object.keys(tvlByTime.data.tokensInUsd.slice(-1)[0].tokens).reduce((acc, key) => acc + tvlByTime.data.tokensInUsd.slice(-1)[0].tokens[key], 0)
        })

        initDonutChart(liquidPopMarketChartElem.current,
            [
                {
                    name: "POP in 80/20 BAL pool",
                    y: statistics.popInBalPool,
                    color: "#7AFB79"
                },
                {
                    name: "WETH in 80/20 BAL pool",
                    y: statistics.wethInBalPool,
                    color: "#9B55FF"
                }
            ]
        )
        initDonutChart(vaultTvlChartElem.current, statistics.vaultTvl.map((item, idx) => {
            return {
                name: item.title,
                y: item.count,
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
        <div className={`text-white p-8`}>
            <h1 className={`font-bold text-[2rem]`}>Popcorn Statistics</h1>
            <p className={`text-[1.125rem] mb-8`}>Total Stats start from 23 June 2023.</p>
            <div className={`grid md:grid-cols-2 gap-[2rem]`}>
                <div className={`bg-[#23262f] rounded-[1rem] border-[#353945] border-[1px] p-6 grid col-span-full md:grid-cols-6 gap-6`}>
                    <div className={`flex flex-col`}>
                        <p className={`text-[1rem]`}>Total Supply</p>
                        <h2 className={`text-[1.5rem] md:text-[1.25rem] lg:text-[1.5rem] font-bold`}>{statistics.totalSupply.toLocaleString()}</h2>
                    </div>
                    <div className={`flex flex-col`}>
                        <p className={`text-[1rem]`}>Liquid Supply</p>
                        <h2 className={`text-[1.5rem] md:text-[1.25rem] lg:text-[1.5rem] font-bold`}>{statistics.liquidSupply.toLocaleString()}</h2>
                    </div>
                    <div className={`flex flex-col`}>
                        <p className={`text-[1rem]`}>FDV</p>
                        <h2 className={`text-[1.5rem] md:text-[1.25rem] lg:text-[1.5rem] font-bold`}>${statistics.fdv.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}</h2>
                    </div>
                    <div className={`flex flex-col`}>
                        <p className={`text-[1rem]`}>Market Cap</p>
                        <h2 className={`text-[1.5rem] md:text-[1.25rem] lg:text-[1.5rem] font-bold`}>${statistics.marketCap.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}</h2>
                    </div>
                    <div className={`flex flex-col`}>
                        <p className={`text-[1rem]`}>POP Price</p>
                        <h2 className={`text-[1.5rem] md:text-[1.25rem] lg:text-[1.5rem] font-bold`}>${statistics.popPrice.toLocaleString(undefined, {maximumFractionDigits: 2, minimumFractionDigits: 2})}</h2>
                    </div>
                    <div className={`flex flex-col`}>
                        <p className={`text-[1rem]`}>Burned POP</p>
                        <h2 className={`text-[1.5rem] md:text-[1.25rem] lg:text-[1.5rem] font-bold`}>Coming Soon</h2>
                    </div>
                </div>
                <div className={`bg-[#23262f] flex flex-col border-[1px] border-[#353945] rounded-[1rem]`}>
                    <div className={`h-[4rem] flex gap-2 border-b-[1px] border-[#353945] px-[1.5rem]`}>
                        <img src="/images/icons/popLogo.svg" alt="Logo" className={`w-8 h-8 self-center`} />
                        <div className={`flex flex-col justify-center`}>
                            <p className={`text-[1rem]`}>POPCORN</p>
                            <p className={`text-[0.625rem]`}>Liquid POP market (Mainnet only)</p>
                        </div>
                    </div>
                    <div className={`py-4 px-6 flex flex-col md:flex-row gap-[3.5rem]`}>
                        <div className={`flex flex-col grow-[1]`}>
                            <div className={`flex justify-between`}>
                                <p>POP in 80/20 BAL pool</p>
                                <p className={`font-bold text-right`}>{statistics.popInBalPool.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>WETH in 80/20 BAL pool</p>
                                <p className={`font-bold text-right`}>{statistics.wethInBalPool.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>BAL LPs</p>
                                <p className={`font-bold text-right`}>{statistics.balLp.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>vePOP (staked LPs)</p>
                                <p className={`font-bold text-right`}>{statistics.vePop.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>cPOP emissions</p>
                                <p className={`font-bold text-right`}>{statistics.cPopEmissions.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>cPOP exercised</p>
                                <p className={`font-bold text-right`}>{(statistics.cPopExercised * 100).toLocaleString()}%</p>
                            </div>
                        </div>
                        <div className={`flex justify-center`} ref={liquidPopMarketChartElem} />
                    </div>
                </div>
                <div className={`bg-[#23262f] flex flex-col border-[1px] border-[#353945] rounded-[1rem]`}>
                    <div className={`h-[4rem] flex justify-between border-b-[1px] border-[#353945] px-[1.5rem]`}>
                        <p className={`text-[0.75rem] sm:text-[1rem] my-auto`}>Sweet Vault TVL</p>
                        <SelectField value={tvlChain} options={chainOptions} onChange={opt => setTvlChain(opt)} />
                    </div>
                    <div className={`py-4 px-6 flex flex-col md:flex-row gap-[3.5rem]`}>
                        <div className={`flex flex-col justify-between grow-[1]`}>
                            {statistics.vaultTvl.map((item, idx) => {
                                return (
                                    <div key={idx} className={`flex justify-between`}>
                                        <p>{item.title}</p>
                                        <p className={`font-bold text-right`}>${item.count.toLocaleString()}</p>
                                    </div>
                                )
                            })}
                        </div>
                        <div className={`flex justify-center`} ref={vaultTvlChartElem} />
                    </div>
                </div>
                <div className={`bg-[#23262f] flex flex-col border-[1px] border-[#353945] rounded-[1rem]`}>
                    <div className={`h-[4rem] flex gap-2 border-b-[1px] border-[#353945] px-[1.5rem]`}>
                        <p className={`text-[1rem] my-auto`}>Total Stats</p>
                    </div>
                    <div className={`py-4 px-6 flex gap-[3.5rem]`}>
                        <div className={`flex flex-col grow-[1]`}>
                            <div className={`flex justify-between`}>
                                <p>Total Revenue</p>
                                <p className={`font-bold text-right`}>${statistics.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>Sweet Vault Fees</p>
                                <p className={`font-bold text-right`}>Coming Soon</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>cPOP Revenue</p>
                                <p className={`font-bold text-right`}>${statistics.cPopRevenue.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>Total Users</p>
                                <p className={`font-bold text-right`}>{statistics.walletsPopMoreZero.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>Public Good Funding</p>
                                <p className={`font-bold text-right`}>${statistics.publicGoodFunding.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>7 Day Cex Volume</p>
                                <p className={`font-bold text-right`}>${statistics.weekCexVolume.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>7 Day Dex Volume</p>
                                <p className={`font-bold text-right`}>${statistics.weekDexVolume.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>{'Wallets with POP > 100'}</p>
                                <p className={`font-bold text-right`}>{statistics.walletsPopMoreHundred.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>{'Wallets with POP > 1,000'}</p>
                                <p className={`font-bold text-right`}>{statistics.walletsPopMoreThousand.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>{'Wallets with POP > 100,000'}</p>
                                <p className={`font-bold text-right`}>{statistics.walletsPopMoreHundredThousand.toLocaleString()}</p>
                            </div>
                            <div className={`flex justify-between`}>
                                <p>{'Wallets with POP > 1,000,000'}</p>
                                <p className={`font-bold text-right`}>{statistics.walletsPopMoreMillion.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`bg-[#23262f] flex flex-col border-[1px] border-[#353945] rounded-[1rem]`}>
                    <div className={`h-[4rem] flex gap-2 border-b-[1px] border-[#353945] px-[1.5rem]`}>
                        <p className={`flex flex-col my-auto`}>
                            <p className={`text-[0.75rem]`}>Total Value locked</p>
                            <p className={`text-[1.5rem] leading-none font-bold`}>
                                ${Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(statistics.tvl)}
                            </p>
                        </p>
                    </div>
                    <div className={`py-4 px-6`}>
                        <div ref={TVLOverTimeChartElem} />
                    </div>
                </div>
                <div className={`col-span-full grid md:grid-cols-3 gap-8`}>
                    <div className={`md:col-span-2`}>
                        <h2 className={`text-[1.5rem] font-bold mb-2`}>{'Snapshot PIP\'s'}</h2>
                        <div className={`bg-[#23262f] flex flex-col border-[1px] border-[#353945] rounded-[1rem]`}>
                            <div className={`min-h-[4rem] max-h-[4rem] grid grid-cols-[2.5rem_1fr] gap-[1rem] md:grid-cols-[2.5rem_1fr_1fr_3rem] content-center border-b-[1px] border-[#353945] px-[1.5rem]`}>
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
                    <div>
                        <h2 className={`text-[1.5rem] font-bold mb-2`}>Leaderboard</h2>
                        <div className={`bg-[#23262f] flex flex-col border-[1px] border-[#353945] rounded-[1rem]`}>
                            <div className={`min-h-[4rem] max-h-[4rem] flex content-center border-b-[1px] border-[#353945] px-[1.5rem]`}>
                                <SelectField value={leaderboardOption} options={leaderboardOptions} onChange={opt => setleaderboardOption(opt)}  />
                            </div>
                            <div className={`py-4 px-6 flex flex-col gap-4 max-h-[30rem] overflow-auto`}>
                                {statistics.leaderboard.map((item, idx) => {
                                    return (
                                        <div key={idx} className={`grid grid-cols-[2.5rem_1fr_1fr] gap-[1rem]`}>
                                            <span>{idx + 1}</span>
                                            <span>{item.address.slice(0, 7)}</span>
                                            <span className={`font-bold`}>{item.count.toLocaleString(undefined, {maximumFractionDigits: 2})} POP</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}