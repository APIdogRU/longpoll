import { stringify } from 'querystring';
import { flatten } from './utils/array-flat';
import { request } from './request';
import converters from './utils/converter';
import { VKAPIClient } from '@apidog/vk-client';
import {
    IVKApiGetLongPollRequest,
    IVKLongPollResult,
    IVKLongPollUpdate
} from '@apidog/vk-typings';
import { ClientRequest } from 'http';

export interface ILongPollProps {
    versionApi?: string;
    versionLongPoll?: number;
    wait?: number;
    mode?: number;
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

const defaultProps: Partial<ILongPollProps> = {
    versionApi: '5.108',
    versionLongPoll: 3,
    mode: 202,
    wait: 25
};

const __debug = process.env.DEBUG_LP !== undefined;

const l = (msg: string) => __debug && process.stdout.write(`[LongPoll] ${msg}\n`);

export class LongPoll {
    private active: boolean = false;
    private server: ILongPollServer;
    private listener: Partial<Record<TLongPollEventType, ILongPollEventListener[]>> = {};
    private apiRequester: VKAPIClient;
    private lastRequest?: ClientRequest;

    private static readonly eventId2ListenerKey: Record<number, TLongPollEventType[]> = {
        4: ['message', 'messageRaw'],
        61: ['userTyping'],
        63: ['usersTyping'],
        64: ['userRecordVoice']
    };

    /**
     * Получение инстанса LongPoll
     */
    public static getInstance = async(auth: string | VKAPIClient, props: ILongPollProps = {}): Promise<LongPoll> => {
        const lp = new LongPoll(auth, props);
        await lp.fetchServer();
        return lp;
    };

    private constructor(auth: string | VKAPIClient, private readonly props: ILongPollProps = {}) {
        if (!auth) {
            throw new Error('token or VKAPIClient is not specified');
        }

        if (typeof auth === 'string') {
            const v = this.getProp('versionApi') as string;

            this.apiRequester = VKAPIClient.getInstance(auth, { v });
        } else {
            this.apiRequester = auth;
        }

        l('Логгирование LongPoll включено');
    }

    private getProp = (key: keyof ILongPollProps) => this.props[key] || defaultProps[key];

    private fetchServer = async() => {
        if (this.server) {
            throw new Error('Server already fetched');
        }

        l('Получение URL для запросов к LongPoll...');

        const params = { lp_version: this.getProp('versionLongPoll') };

        const server = await this.apiRequester.perform<IVKApiGetLongPollRequest>('messages.getLongPollServer', params);
        this.setServer(server);
    };

    private setServer = (server: IVKApiGetLongPollRequest) => {
        this.server = server;
        l(`Изменены данные URL для запросов: server = ${server.server}; key = ${server.key}; ts = ${server.ts}`);
    };

    /**
     * Подписка на события
     */
    public on = (event: TLongPollEventType, listener: ILongPollEventListener) => {
        if (!this.listener[event]) {
            this.listener[event] = [];
        }

        this.listener[event].push(listener);
    };

    /**
     * Проверка статуса запуска LongPoll
     */
    public isActive = () => this.active;

    /**
     * Запуск пулинга
     */
    public start = async() => {
        this.active = true;
        while (this.active) {
            await this.makeRequest();
        }
    };

    public stop = () => {
        if (!this.active) {
            return;
        }

        if (this.lastRequest) {
            this.lastRequest.abort();
        }

        this.active = false;
    };

    /**
     * Запрос к LongPoll серверу
     */
    private makeRequest = async() => {
        const params = {
            act: 'a_check',
            ts: this.server.ts,
            key: this.server.key,
            wait: this.getProp('wait'),
            mode: this.getProp('mode')
        };

        const url = `https://${this.server.server}?${stringify(params)}`;

        try {
            const json = await request<IVKLongPollResult>(url, this.requestHandler);

            this.server.ts = json.ts;
            this.handleEvents(json.updates);
        } catch (e) {
            l(`Произошла ошибка при опросе: ${e.message}`);
            l('Пуллинг запросов остановлен');
            this.active = false;
            throw e;
        }
    };

    /**
     * Обработчик запрсов
     */
    private requestHandler = (request: ClientRequest) => {
        this.lastRequest = request;
    };

    /**
     * Обработка сырых данных, конвертация в объекты и вызо
     */
    private handleEvents = (updates: IVKLongPollUpdate[]) => {
        if (!this.active) {
            return;
        }

        updates.forEach(async update => {
            const [eventId] = update;
            const listenerKeys = this.getListenersByEventId(eventId);
            const listeners = flatten(listenerKeys.map(key => this.listener[key]));

            if (!listeners) {
                return;
            }

            const event = await converters[eventId](update);

            listeners.forEach(listener => listener(event));
        });
    };

    /**
     * Получение слушателей события по идентификатору события
     */
    private getListenersByEventId = (eventId: number) => LongPoll.eventId2ListenerKey[eventId] || [];

    public getServer = () => this.server;
}
