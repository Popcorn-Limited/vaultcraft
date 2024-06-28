import { VaultData } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";

export default function ApyChart({ vault }: { vault: VaultData }): JSX.Element {
  const chartElem = useRef(null);

  const [apyData, setApyData] = useState<any[]>([])
  const [from, setFrom] = useState<number>(0)
  const [to, setTo] = useState<number>(1)

  useEffect(() => {
    async function setUp() {
      setApyData(vault.apyHist);
      setTo(vault.apyHist.length - 1)
      initMultiLineChart(chartElem.current, vault.apyHist);
    }
    setUp()
  }, [])

  return (
    <>
      <div className="bg-customNeutral200 p-6 rounded-lg">
        <h2 className="text-white font-bold text-2xl">Vault APY</h2>
        {/* <div className="flex flex-row items-end px-12 pt-4 pb-4 space-x-4 text-white">
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

        </div> */}
        <div className={`flex justify-center`} ref={chartElem} />
      </div>
    </>
  )
}

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
      labels: {
        style: {
          color: "#fff"
        }
      }
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