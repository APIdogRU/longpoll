import {
    IVKLongPollUpdate,
    IVKLongPollUpdateMessageNew,
    IVKLongPollUpdateUserTyping,
    IVKLongPollUpdateFlagReplace,
    IVKLongPollUpdateUserTypingInChat,
    IVKLongPollUpdateNewDialogsCount,
    IVKLongPollUpdateFlagSet,
    IVKLongPollUpdateFlagReset
} from '../typings/longpoll';
import { IVKMessage } from '../typings';

export type ILongPollConverter<T> = (update: IVKLongPollUpdate) => Promise<T>;

export default {
    '1': async(update: IVKLongPollUpdateFlagReplace) => {
        const [, messageId, flag] = update;
        return { messageId, flag };
    },

    '2': async(update: IVKLongPollUpdateFlagSet) => {
        const [, messageId, flag, peerId] = update;

        return { messageId, flag, peerId };
    },

    '3': async(update: IVKLongPollUpdateFlagReset) => {
        const [, messageId, flag, peerId ] = update;

        return { messageId, flag, peerId };
    },

    '4': async(update: IVKLongPollUpdateMessageNew) => {
        const [, id, flags, from_id, date, title, text, extra, attachments] = update;

        return {
            id,
            date,
            peer_id: extra.peer_id || from_id,
            from_id,
            out: (flags & 2) > 0,
            text
        } as IVKMessage;
    },

    '61': async(update: IVKLongPollUpdateUserTyping) => {
        const [, userId] = update;
        
        return { userId };
    },

    '62': async(update: IVKLongPollUpdateUserTypingInChat) => {
        const [, userId, chatId] = update;
        
        return { userId, chatId };
    },

    '80': async(update: IVKLongPollUpdateNewDialogsCount) => {
        const [, count] = update;

        return { count };
    }
} as Record<number, ILongPollConverter<any>>;
