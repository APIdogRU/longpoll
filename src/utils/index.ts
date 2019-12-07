export enum DialogType {
    USER = 1,
    CHAT = 2,
    GROUP = 3,
    EMAIL = 4
}

const LIMIT = 2e9;

export const getTypeByPeer = (peerId: number): DialogType => {
    if (peerId > 0) {
        return peerId < LIMIT
            ? DialogType.USER
            : DialogType.CHAT;
    } else {
        return peerId > -LIMIT
            ? DialogType.GROUP
            : DialogType.EMAIL;
    }
};
