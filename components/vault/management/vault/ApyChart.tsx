import MainActionButton from "@/components/button/MainActionButton";
import InputNumber from "@/components/input/InputNumber";
import { Strategy } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Highcharts, { chart } from "highcharts";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";

function initMultiLineChart(elem: null | HTMLElement, data: any[]) {
  if (!elem) return;

  Highcharts.chart(elem, {
    chart: {
      // @ts-ignore
      zoomType: "xy",
      backgroundColor: "transparent",
    },
    title: {
      text: '',
      style: { color: "#fff" }
    },
    tooltip: {
      shared: true,
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      labels: {
        style: {
          color: "#fff",
        },
      },
      title: {
        text: "",
      },
    },
    credits: {
      enabled: false
    },
    legend: {
      itemStyle: { color: "#fff" }
    },
    series: [
      {
        name: 'Total Apy',
        data: data.map((d, i) => [Date.UTC(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()), d.apy || 0]),
        type: "line"
      },
      {
        name: 'Base Apy',
        data: data.map((d, i) => [Date.UTC(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()), d.apyBase || 0]),
        type: "line"
      },
      {
        name: 'Reward Apy',
        data: data.map((d, i) => [Date.UTC(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()), d.apyReward || 0]),
        type: "line"
      },
    ],
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          fillColor: "#7AFB79",
          lineColor: "#7AFB79",
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
  },
    () => ({})
  );

}

async function getApy(strategy: Strategy) {
  const { data } = await axios.get(`https://pro-api.llama.fi/${process.env.DEFILLAMA_API_KEY}/yields/chart/${strategy.apyId}`)
  return data.data.map((entry: any) => { return { apy: entry.apy, apyBase: entry.apyBase, apyReward: entry.apyReward, date: new Date(entry.timestamp) } })
}

export default function ApyChart({ strategy }: { strategy: Strategy }): JSX.Element {
  const chartElem = useRef(null);

  const [apyData, setApyData] = useState<any[]>([])
  const [from, setFrom] = useState<number>(0)
  const [to, setTo] = useState<number>(1)

  useEffect(() => {
    async function setUp() {
      const _apyData = await getApy(strategy);
      setApyData(_apyData);
      setTo(_apyData.length - 1)
      initMultiLineChart(chartElem.current, _apyData);
    }
    setUp()
  }, [])

  return (
    <>
      <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-0">
        <h3 className="text-white font-bold text-xl">Vault APY</h3>
        <div className="flex flex-row items-end px-12 pt-4 pb-4 space-x-4 text-white">
          <div>
            <p>From</p>
            <div className="border border-customGray500 rounded-md p-1">
              <InputNumber
                value={from}
                onChange={(e) => setFrom(Number(e.currentTarget.value))}
                type="number"
              />
            </div>
          </div>
          <div>
            <p>To</p>
            <div className="border border-customGray500 rounded-md p-1">
              <InputNumber
                value={to}
                onChange={(e) => setTo(Number(e.currentTarget.value))}
                type="number"
              />
            </div>
          </div>
          <div className="w-40">
            <MainActionButton
              label="Filter"
              handleClick={() =>
                initMultiLineChart(
                  chartElem.current,
                  apyData.filter((_, i) => i >= from && i <= to)
                )
              }
            />
          </div>
          <div className="w-40">
            <SecondaryActionButton
              label="Reset"
              handleClick={() => {
                setFrom(0);
                setTo(apyData.length - 1);
                initMultiLineChart(
                  chartElem.current,
                  apyData
                )
              }}
            />
          </div>

        </div>
        <div className={`flex justify-center`} ref={chartElem} />
      </section>
    </>
  )
}