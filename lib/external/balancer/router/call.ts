import axios from 'axios';

export const balancerApiProxyCall = async (): Promise<void> => {
    const endpointUrl = "/api/balancerProxy/sor/1";

    const data = {
        sellToken: "0xba100000625a3754423978a60c9317c58a424e3d",
        buyToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
        orderKind: "sell",
        amount: "1000000000000000000",
        gasPrice: "10000000",
    };

    try {
        const response = await axios.post(endpointUrl, data, { headers: { 'Content-Type': 'application/json' } });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
