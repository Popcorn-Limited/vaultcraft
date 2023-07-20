import axios from 'axios';
import { BalancerData, BalancerAdapterData } from './interfaces';

export const balancerApiProxyCall = async (balancerParams: BalancerData): Promise<BalancerAdapterData> => {
    const endpointUrl = "/api/balancerProxy/sor/1";

    try {
        const response = await axios.post(endpointUrl, balancerParams, { headers: { 'Content-Type': 'application/json' } });
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};