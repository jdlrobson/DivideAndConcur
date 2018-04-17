import assert from 'assert';
import { mapCard } from './../../src/helpers/cards';

describe('Helper:cards', () => {
    it('mapCard', () => {
        const card = mapCard(false, '要', true);

        assert.ok(card.character === '要', 'character is there');
        assert.ok(card.pinyin !== undefined, 'has pinyin');
        assert.ok(card.english !== undefined, 'has english');
        assert.ok(card.english.indexOf(';') === -1,
            'multiple definitions have been split up');
        assert.ok(card.translations.length > 1, 'has a list of all the translations');
        assert.ok(card.decompositions.length !== undefined, 'has decompositions');
    });
});
