import {} from 'jest';
import { getTypeByPeer, DialogType } from '../src/utils';

describe('Utils', () => {
    it('Peers returns correct values', () => {
        expect(getTypeByPeer(100)).toBe(DialogType.USER);
        expect(getTypeByPeer(-1)).toBe(DialogType.GROUP);
        expect(getTypeByPeer(2e9 + 3)).toBe(DialogType.CHAT);
        expect(getTypeByPeer(-2e9 - 2)).toBe(DialogType.EMAIL);
    });
});
