import axios from 'axios';
import { BalancerData, BalanceSORResponse } from './interfaces';

export const balancerApiProxyCall = async (balancerParams: BalancerData): Promise<BalanceSORResponse> => {
    const endpointUrl = "/api/balancerProxy/sor/1";

    try {
        const response = await axios.post(endpointUrl, balancerParams, { headers: { 'Content-Type': 'application/json' } });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};