import { request as req } from 'https';
import { ClientRequest } from 'http';

export type FHandlerRequest = (request: ClientRequest) => any;

export const request = async<T>(url: string, handler?: FHandlerRequest) => new Promise<T>((resolve, reject) => {
    const request = req(url, res => {
        let data = '';

        res.on('data', chunk => data += chunk);

        res.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(e);
            }
        });
    }).on('error', e => {
        reject(e);
    });

    handler && handler(request);
});
