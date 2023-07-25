interface AuraPool {
  id: string;
  isShutdown: boolean;
  aprs: {
    total: number;
    breakdown: {
      id: string;
      token: {
        symbol: string;
        name: string;
      };
      name: string;
      value: number;
    }[];
  };
  lpToken: {
    address: string;
  };
}

export default async function getAuraPools(chainId: number): Promise<AuraPool[]> {
  const res = await (await fetch('https://data.aura.finance/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query Pools($chainId: Int = 1) {
          pools(chainId: $chainId){
            id
            lpToken
            {
              address
            }
            aprs {
              total
              breakdown {
                id
                token{
                  symbol
                  name
                }
              name
              value
              }
            }
          }
        }
      `,
      variables: {
        chainId: chainId,
      },
    }),
  })).json()
  return res.data.pools
}