import { Token } from "@/lib/types";
import MainActionButton from "@/components/button/MainActionButton";
import InputNumber from "@/components/input/InputNumber";
import { useEffect, useRef, useState } from "react";
import Highcharts, { chart } from "highcharts";
import Modal from "@/components/modal/Modal";
import CopyToClipboard from "react-copy-to-clipboard";
import { showSuccessToast } from "@/lib/toasts";
import { Square2StackIcon } from "@heroicons/react/24/outline";
import SecondaryActionButton from "@/components/button/SecondaryActionButton";

function initBarChart(elem: null | HTMLElement, data: any[], setShowModal: Function, setModalContent: Function) {
  if (!elem) return;

  Highcharts.chart(elem,
    {
      chart: {
        type: 'column',
        backgroundColor: "transparent",
      },
      title: {
        text: '',
        style: { color: "#fff" }
      },
      xAxis: {
        categories: data.map(entry => String(entry.day)),
        labels: {
          style: {
            color: "#fff",
          },
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
      plotOptions: {
        column: {
          borderRadius: '25%',
          point: {
            events: {
              click: function () {
                setModalContent(data.find(d => d.day === Number(this.category)).logs)
                setShowModal(true)
              }
            }
          }
        }
      },
      series: [
        {
          name: 'Deposit',
          data: data.map(entry => entry.deposits),
          type: "column"
        },
        {
          name: 'Withdrawal',
          data: data.map(entry => -entry.withdrawals),
          type: "column"
        },
        {
          name: 'Net',
          data: data.map(entry => entry.net),
          type: "column"
        }
      ]
    },
    () => ({})
  );
}

export default function NetFlowChart({ logs, asset }: { logs: any[], asset?: Token }): JSX.Element {
  const chartElem = useRef(null);

  const [filterAddress, setFilterAddress] = useState<string>("0x")
  const [from, setFrom] = useState<number>(0)
  const [to, setTo] = useState<number>(logs.length - 1)

  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState<any[]>([])

  useEffect(() => {
    initBarChart(chartElem.current, logs.filter(log => log.deposits > 0 || log.withdrawals > 0), setShowModal, setModalContent)
  }, [logs])

  return (
    <>
      <Modal visibility={[showModal, setShowModal]}>
        {modalContent.length > 0 ?
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left font-semibold sm:pl-0">Type</th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">Value</th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">Address</th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {modalContent.map(log =>
                <tr key={log.transactionHash}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 font-medium sm:pl-0">
                    <h2 className="text-lg text-white text-start">
                      {log.eventName}
                    </h2>
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-gray-500 text-start">
                    {Number(log.args.assets) / (10 ** asset?.decimals!)} {asset?.symbol!}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-gray-500 text-start">
                    {log.args.owner}
                  </td>

                  <td className="whitespace-nowrap px-3 py-4 text-gray-500">
                    <div className="flex flex-row items-center justify-between">
                      {log.transactionHash.slice(0, 4)}...{log.transactionHash.slice(-4)}
                      <div className='w-6 h-6 cursor-pointer group/txHash'>
                        <CopyToClipboard text={log.transactionHash} onCopy={() => showSuccessToast("Tx Hash copied!")}>
                          <Square2StackIcon className="text-white group-hover/txHash:text-primaryYellow" />
                        </CopyToClipboard>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          : <></>
        }
      </Modal>
      <section className="md:border-b border-customNeutral100 py-10 px-4 md:px-8">
        <h3 className="text-white font-bold text-xl">Vault In- and Outflows</h3>
        <div className="flex flex-row items-end px-12 pt-4 pb-4 space-x-4 text-white">
          <div>
            <p>User Address</p>
            <div className="border border-customGray500 rounded-md p-1">
              <InputNumber
                value={filterAddress}
                onChange={(e) => setFilterAddress(e.currentTarget.value)}
                type="text"
              />
            </div>
          </div>
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
                initBarChart(
                  chartElem.current,
                  logs.filter((_, i) => i >= from && i <= to)
                    .filter(entry => filterAddress === "" ? true : entry.logs.some((log: any) => log.args.owner.toLowerCase().includes(filterAddress)))
                    .filter(log => log.deposits > 0 || log.withdrawals > 0),
                  setShowModal,
                  setModalContent
                )
              }
            />
          </div>
          <div className="w-40">
            <SecondaryActionButton
              label="Reset"
              handleClick={() => {
                setFilterAddress("0x");
                setFrom(0);
                setTo(logs.length - 1);
                initBarChart(
                  chartElem.current,
                  logs.filter(log => log.deposits > 0 || log.withdrawals > 0),
                  setShowModal,
                  setModalContent
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