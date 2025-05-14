const { apply, allow } = require("defi-kit");

const WETH = "0x82af49447d8a07e3bd95bd0d56f35241523fbab1";
const USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const roleModule = "0xcB0C04f738515F529330a4b807b58ebD2C0604E7"; // zodiac roles module contract
const role =
  "0x4d616e6167657200000000000000000000000000000000000000000000000000"; // Manager string to bytes32

// const createCalls = async () => {
//     const calls = await apply("0x4d616e6167657200000000000000000000000000000000000000000000000000", [allow.cowSwap.swap(AWETH, USDC)], {
//         address: "0xcB0C04f738515F529330a4b807b58ebD2C0604E7",
//         mode: "extend",
//       })

//     console.log(calls);
// }

// const calls = await res.json()

// "https://kit.karpatkey.com/api/v1/eth:<MOD>/<ROLE>/allow/cowswap/swap?sell=<TOKEN_IN>&buy=<TOKEN_OUT>"
const createCalls = async () => {
  const url = `https://kit.karpatkey.com/api/v1/arb1:${roleModule}/${role}/allow/cowswap/swap?sell=${USDC}&buy=${WETH}`;
  console.log(url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data.transactions);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

createCalls();

/*
[
  {
    to: '0xcB0C04f738515F529330a4b807b58ebD2C0604E7',
    value: '0',
    contractMethod: { inputs: [Array], name: 'scopeTarget', payable: false },
    contractInputsValues: {
      roleKey: '0x4d616e6167657200000000000000000000000000000000000000000000000000',
      targetAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' // allow WETH 
    }
  },
  {
    to: '0xcB0C04f738515F529330a4b807b58ebD2C0604E7',
    value: '0',
    contractMethod: { inputs: [Array], name: 'scopeFunction', payable: false },
    contractInputsValues: {
      roleKey: '0x4d616e6167657200000000000000000000000000000000000000000000000000',
      targetAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Weth
      selector: '0x095ea7b3', // approve  
      conditions: '[["0","5","5","0x"],["0","1","16","0x000000000000000000000000c92e8bdf79f0507f65a392b0ab4667716bfe0110"]]', // cowswap contract
      options: '0'
    }
  },
  {
    to: '0xcB0C04f738515F529330a4b807b58ebD2C0604E7',
    value: '0',
    contractMethod: { inputs: [Array], name: 'scopeTarget', payable: false },
    contractInputsValues: {
      roleKey: '0x4d616e6167657200000000000000000000000000000000000000000000000000',
      targetAddress: '0x23dA9AdE38E4477b23770DeD512fD37b12381FAB' // cowswap order signer
    }
  },
  {
    to: '0xcB0C04f738515F529330a4b807b58ebD2C0604E7',
    value: '0',
    contractMethod: { inputs: [Array], name: 'scopeFunction', payable: false },
    contractInputsValues: {
      roleKey: '0x4d616e6167657200000000000000000000000000000000000000000000000000',
      targetAddress: '0x23dA9AdE38E4477b23770DeD512fD37b12381FAB',
      selector: '0x569d3489',
      conditions: '[["0","5","5","0x"],["0","3","5","0x"],["1","1","16","0x00000000000000000000000082af49447d8a07e3bd95bd0d56f35241523fbab1"],["1","1","16","0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831"],["1","1","15","0x"],["1","1","0","0x"],["1","1","0","0x"],["1","1","0","0x"],["1","1","0","0x"],["1","1","0","0x"],["1","1","0","0x"],["1","1","0","0x"],["1","1","0","0x"],["1","1","0","0x"]]',
      options: '2'
    }
  },
  {
    to: '0xcB0C04f738515F529330a4b807b58ebD2C0604E7',
    value: '0',
    contractMethod: { inputs: [Array], name: 'allowFunction', payable: false },
    contractInputsValues: {
      roleKey: '0x4d616e6167657200000000000000000000000000000000000000000000000000',
      targetAddress: '0x23dA9AdE38E4477b23770DeD512fD37b12381FAB',
      selector: '0x5a66c223',
      options: '2'
    }
  }
]
*/
