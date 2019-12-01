import { IVKApiMessagesGetById, IVKApiError, IVKApiResponse } from '../typings/vkapi';
import request from '../request';
import { stringify } from 'querystring';

export type ApiClient = <T>(method: string, params?: Record<string, string>) => Promise<T>;

const apiRequest = async<T>(method: string, params: Record<string, string>): Promise<T> => {
    const qs = stringify(params);
    const url = `https://api.vk.com/method/${method}?${qs}`;
    console.log(url);
    const result = await request<T>(url);

    if ('error' in result) {
        const { error } = result as unknown as IVKApiError;
        throw new Error(`API error #${error.error_code}: ${error.error_msg}`);
    }

    return (result as unknown as IVKApiResponse<T>).response;
};

export default apiRequest;

export const apiClient = (token: string, v: string = '5.108'): ApiClient => {
    return async<T>(method: string, params: Record<string, string> = {}): Promise<T> => {
        params.access_token = token;
        if (!params.v) {
            params.v = v;
        }
        return apiRequest(method, params);
    };
};

export const fetchMessageById = async(id: number) => {
    const { response } = await apiRequest<IVKApiMessagesGetById>('messages.getById', {
        message_ids: String(id)
    });

    if (!response.items.length) {
        throw new Error('Message not found');
    }

    return response.items[0];
};
