import axios, { AxiosRequestConfig } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.url) {
        res.status(400).json({ error: "Missing request URL" });
        return;
    }

    try {
        const url = 'https://api.balancer.fi' + req.url.replace('/api/balancerProxy', '');
        const config: AxiosRequestConfig = {
            method: req.method as any,
            url: url,
            data: req.body,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await axios(config);

        res.status(response.status).json(response.data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
