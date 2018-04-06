import DictionaryUtils from './../data/DictionaryUtils';
import assert from 'assert';

const difficulties = { '口': 3, '云': 5, '人': 1, '一': 0.5, '辶': 8, '车': 10 };
const decompositions = { '回': ['口', '口'],
    '会': ['人', '云'],
    '𥫗': ['𥫗'],
    '云': ['一', ''],
    '莲': ['艹', '连'],
    '连': [ '辶', '车' ]
};
const words = {};
const utils = new DictionaryUtils(words, decompositions, difficulties);

describe('DictionaryUtils', () => {
    it('getPinyin', () => {
        const utils = new DictionaryUtils(words, decompositions, difficulties);
        assert.equal(utils.getPinyin('𥫗'), 'shì');
    });
    it('getDifficultyRating', () => {
        assert.ok(utils.getDifficultyRating('回') === 6);
        assert.ok(utils.getDifficultyRating('会') === 6);
        assert.ok(utils.getDifficultyRating('连') === 18);
    });
    it('getWordLength', () => {
        assert.ok(utils.getWordLength('艹') === 0, 'If not registered, is zero');
        assert.ok(utils.getWordLength('人') === 0, '人 size 0');
        assert.ok(utils.getWordLength('一') === 0, 'size 0');
        assert.ok(utils.getWordLength('云') === 1, 'size 1');
        assert.ok(utils.getWordLength('回') === 2, 'size 2');
        assert.ok(utils.getWordLength('会') === 3);
        assert.ok(utils.getWordLength('莲') === 3);
        assert.ok(utils.getWordLength('𥫗') === 0, 'Protect against decomposing to itself');
    });
});
