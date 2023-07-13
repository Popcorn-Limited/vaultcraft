const ADDRESS_TO_SYMBOL = {
  "0xc8c88fdf2802733f8c4cd7c0be0557fdc5d2471c": "ousd",
  "0x95ca391fb08f612dc6b0cbddcb6708c21d5a8295": "oeth"
}

export async function origin({ chainId, address }: { chainId: number, address: string }): Promise<number> {
  const res = await (await fetch(
    // @ts-ignore
    `https://analytics.ousd.com/api/v2/${ADDRESS_TO_SYMBOL[address.toLowerCase()]}/apr/trailing/30`
  )).json();

  return Number(res.apy)
};
