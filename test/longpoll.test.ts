import {} from 'jest';
import { LongPoll } from '../src/index';
import { VKAPIClient } from '@apidog/vk-client';

const token = process.env.VK_TOKEN;

describe('LongPoll', () => {
    it('should pass token, get server and connect to longpoll', done => {
        LongPoll.getInstance(token, { versionApi: '5.68', wait: 1 }).then(longpoll => {
            const server = longpoll.getServer();
            expect(server.server).toBeDefined();
            expect(longpoll.isActive()).not.toBeTruthy();
            longpoll.start();
            expect(longpoll.isActive()).toBeTruthy();
            longpoll.stop();
            expect(longpoll.isActive()).not.toBeTruthy();
            setTimeout(done, 2500);
        });
    });

    it('should pass vk-client, get server and connect to longpoll', done => {
        const client = VKAPIClient.getInstance(token, { v: '5.68' });

        LongPoll.getInstance(client, { wait: 1 }).then(longpoll => {
            const server = longpoll.getServer();
            expect(server.server).toBeDefined();
            expect(longpoll.isActive()).not.toBeTruthy();
            longpoll.start();
            expect(longpoll.isActive()).toBeTruthy();
            longpoll.stop();
            expect(longpoll.isActive()).not.toBeTruthy();
            setTimeout(done, 2500);
        });
    });
});
