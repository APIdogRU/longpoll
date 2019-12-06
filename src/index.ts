import request from './request';
import {
    IVKApiGetLongPollRequest,
    IVKLongPollResult,
    IVKLongPollUpdate
} from '@apidog/vk-typings';
import converters from './utils/converter';
import VKAPIClient from '@apidog/vk-client';

export interface ILongPollProps {
    token: string;
    version?: number; // TODO
    wait?: number; // TODO
    mode?: number; // TODO
}

export interface ILongPollServer {
    server: string;
    key: string;
    ts: number;
    wait?: number;
}

export type TLongPollEventType = 'message' | 'messageRaw' | 'friendOnline' | 'friendOffline' | 'userTyping' | 'usersTyping' | 'userRecordVoice';

export type ILongPollEventListener = (event: ILongPollEvent<any>) => any;

export interface ILongPollEvent<T> {
    data: T;
    raw: IVKLongPollUpdate;
}

export class LongPoll {
    private isActive: boolean = false;
    private server: ILongPollServer;
    private listener: Partial<Record<TLongPollEventType, ILongPollEventListener[]>> = {};
    private requester: VKAPIClient;

    private static readonly eventId2ListenerKey: Record<number, TLongPollEventType[]> = {
        4: ['message', 'messageRaw'],
        61: ['userTyping'],
        63: ['usersTyping'],
        64: ['userRecordVoice']
    };

    constructor(token: string) {
        if (!token) {
            throw new Error('token is not specified');
        }
        this.requester = VKAPIClient.getInstance(token);
    }

    fetchServer = async() => {
        if (this.server) {
            throw new Error('Server already fetched');
        }
        const server = await this.requester.perform<IVKApiGetLongPollRequest>('messages.getLongPollServer');
        this.setServer(server);
    };

    private setServer = (server: IVKApiGetLongPollRequest) => {
        this.server = server;
    };

    public on = (event: TLongPollEventType, listener: ILongPollEventListener) => {
        if (!this.listener[event]) {
            this.listener[event] = [];
        }

        this.listener[event].push(listener);
    };

    public start = async() => {
        this.isActive = true;
        while (this.isActive) {
            console.log('active, started, ts = ' + this.server.ts);
            await this.makeRequest();
        }
    };

    private makeRequest = async() => {
        const json = await request<IVKLongPollResult>(`https://${this.server.server}?act=a_check&key=${this.server.key}&wait=25&ts=${this.server.ts}&mode=202`, {});

        this.server.ts = json.ts;
        this.handleEvents(json.updates);
    };

    private handleEvents = (updates: IVKLongPollUpdate[]) => {
        updates.forEach(async update => {
            const [eventId] = update;
            const listenerKeys = LongPoll.eventId2ListenerKey[eventId] || [];
            const hasListener = listenerKeys.some(key => this.listener[key] && this.listener[key].length);

            if (!hasListener) {
                return;
            }

            const event = await converters[eventId](update);

            listenerKeys.forEach(key => {
                this.listener[key] && this.listener[key].map(listener => listener(event));
            });
        });
    };
}


const getLongPoll = async(props: ILongPollProps): Promise<LongPoll> => {
    const lp = new LongPoll(props.token);
    await lp.fetchServer();
    return lp;
};

export default getLongPoll;
