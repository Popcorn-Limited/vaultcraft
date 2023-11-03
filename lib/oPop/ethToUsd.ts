import { useState, useEffect } from 'react';
import axios from 'axios';
import { formatEther, parseEther, parseUnits } from 'viem';

async function getEthToUsdPrice(): Promise<number> {
    try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        return response.data.ethereum.usd;
    } catch (error) {
        throw new Error('Failed to fetch ETH price from CoinGecko');
    }
}

async function convertEthToUsd(ethAmount: bigint): Promise<bigint> {
    const ethToUsdPrice = await getEthToUsdPrice();
    const ethAmountFloat = parseFloat(formatEther(ethAmount));
    const usdValue = ethAmountFloat * ethToUsdPrice;
    return parseEther(usdValue.toString());
}

export function useEthToUsd(ethAmount: bigint) {
    const [usdValue, setUsdValue] = useState<bigint | null>(null);

    useEffect(() => {
        async function fetchUsdValue() {
            try {
                const value = await convertEthToUsd(ethAmount);
                setUsdValue(value);
            } catch (error) {
                console.error(error);
            }
        }

        fetchUsdValue();
    }, [ethAmount]);

    return usdValue;
}