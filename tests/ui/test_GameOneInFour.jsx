import assert from 'assert';
import { getCardProps } from './../../src/ui/GameOneInFour';

describe('GameOneInFour', () => {
    it('all pinyin same length', () => {
        const cards = [
            { character: '火', rating: 24, wordLength: 3, pinyin: 'huǒ' },
            { character: '山', rating: 24, wordLength: 3, pinyin: 'shān' },
            { character: '瓜', rating: 24, wordLength: 3, pinyin: 'guā' },
            { character: '西', rating: 24, wordLength: 3, pinyin: 'xī' },
            { character: '西瓜', rating: 24, wordLength: 3, pinyin: 'xī guā' },
        ];
        cards.forEach((cardProps) => {
            const props = getCardProps(cardProps, 0, { character: '火山', pinyin: 'huǒ shān' });
            assert.ok(Array.from(props.displayCharacter || props.character).length === 2,
                'character is made up');
            assert.equal(props.pinyin.split(' ').length, 2,
                `if the target card has 2 word pinyin other cards should too: (${props.pinyin})`
            );
        });
        cards.forEach((cardProps) => {
            const props = getCardProps(cardProps, 0, { pinyin: 'huǒ', character: '火' });
            assert.ok(Array.from(props.displayCharacter || props.character).length === 1,
                'character is split too');
            assert.equal(props.pinyin.split(' ').length, 1,
                `if the target card has 1 word pinyin other cards should too: (${props.pinyin})`
            );
        });
        cards.forEach((cardProps) => {
            const props = getCardProps(cardProps, 0, { pinyin: 'huǒ', character: '火' });
            assert.equal(props.pinyin.split(' ').length, 1,
                `if the target card has 1 word pinyin other cards should too: (${props.pinyin})`
            );
        });
    });

});
