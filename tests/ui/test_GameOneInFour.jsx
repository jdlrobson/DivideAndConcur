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
            const props = getCardProps(cardProps, 0, { pinyin: 'huǒ shān' });
            assert.equal(props.label.split(' ').length, 2,
                `if the target card has 2 word pinyin other cards should too: (${props.label})`
            );
            assert.ok(props.isWide, '2 chars long = wide');
        });
        cards.forEach((cardProps) => {
            const props = getCardProps(cardProps, 0, { pinyin: 'huǒ' });
            assert.equal(props.label.split(' ').length, 1,
                `if the target card has 1 word pinyin other cards should too: (${props.label})`
            );
            assert.ok(props.isWide === false, '1 chars long != wide');
        });
    });

});
