import { mapCard, translationArray } from './../../src/helpers/cards';
import assert from 'assert';

describe('Helper:cards', () => {
    it('translationArray', () => {
        assert.ok(translationArray('foo;bar').length === 2, 'has 2 definitions');
        assert.ok(translationArray('foo;bar;').length === 2, 'has 2 definitions');
        assert.ok(translationArray('foo;bar; ').length === 2, 'has 2 definitions');
    });
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
