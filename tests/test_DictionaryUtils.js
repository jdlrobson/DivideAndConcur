import DictionaryUtils from './../data/DictionaryUtils';
import assert from 'assert';

const difficulties = { '口': 3, '云': 5, '人': 1, '一': 0.5, '辶': 8, '车': 10 };
const decompositions = { '回': ['口', '口'],
    '舅': [ '臼', '男'],
    '男': [ '田', '力' ],
    '母': [ '毋' ],
    '锦': [ '钅', '帛' ],
    '哇': [ '口', '圭' ],
    '圭': [ '土', '土' ],
    '帛': [ '白', '巾' ],
    '𠮷': ['土', '口'],
    '会': ['人', '云'],
    '天': ['大','一'],
    '减': [ '冫', '咸'],
    '咸': ['戌', '口'],
    '戌': ['戊','一'],
    '𥫗': ['𥫗'],
    '云': ['一', ''],
    '莲': ['艹', '连'],
    '连': [ '辶', '车' ]
};
const words = {};
const wordsForWordLength = {
    '大': 'big',
    '艹': 'grass',
    '辶': 'walk',
    '车': 'car',
    '土': 'soil',
    '天': 'sky',
    '哇': 'wow',
    '人': 'person',
    '口': 'mouth',
    '一': 'one',
    '白': 'white',
    '巾': 'towel'
};
const utils = new DictionaryUtils(words, decompositions, difficulties);

describe('DictionaryUtils', () => {
    it('translate', () => {
        const utils = new DictionaryUtils(words, decompositions, difficulties);
        assert.equal(utils.translate('𠮷'), '? (? · ?)');
    });
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
        const utils = new DictionaryUtils(wordsForWordLength, decompositions, difficulties);
        assert.ok(utils.getWordLength('爸') === 0, 'No decomposition');
        assert.strictEqual(utils.getWordLength('爸爸'), 1,
            'Neither character has decomp but still length 1');
        assert.ok(utils.getWordLength('舅舅') < utils.getWordLength('舅母'),
            'Word length of 2 characters which are same is less than 2 that are not.');
        assert.ok(utils.getWordLength('艹') === 0, 'If not registered, is zero');
        assert.ok(utils.getWordLength('人') === 0, '人 size 0');
        assert.ok(utils.getWordLength('一') === 0, 'size 0');
        assert.ok(utils.getWordLength('云') === 1, 'size 1 (云) - empty strings ignored');
        assert.ok(utils.getWordLength('回') === 2, 'size 2');
        assert.ok(utils.getWordLength('会') === 2, 'size 2 人(1) + 云(1)');
        assert.strictEqual(utils.getWordLength('莲'), 3, '莲 is size 3');
        assert.ok(utils.getWordLength('𥫗') === 0, 'Protect against decomposing to itself');
        assert.ok(utils.getWordLength('戊') === 0, 'No decompositions');
        assert.strictEqual(utils.getWordLength('戌'), 3,
            '戌 has 2 decompositions but 戊 is not a known word so additional penalty');
        assert.strictEqual(utils.getWordLength('咸'), 4,
            'Has 3 decompositions (戌 decompositions plus 口). 戌 not known.');
        assert.strictEqual(utils.getWordLength('减'), 6,
            'Has 4 decompositions (咸 decompositions plus 口) but 咸 and 戌 not known.');
        assert.strictEqual(utils.getWordLength('天'), 2, '天 has 2 known decompositions (大 and 一)');
        assert.strictEqual(utils.getWordLength('天人'), 3, 'Has 3 decompositions (大 and 一 and 人)');
        assert.strictEqual(utils.getWordLength('哇'), 3,
            '哇 decomposes to 2 characters ' +
            'and one of those (圭) to 2' +
            'no word length penalty as 口 is a known word');
        assert.strictEqual(utils.getWordLength('锦'), 4,
            'Although 锦 decomposes to 2 characters ' +
            'and one of those (帛) to 白 and 巾, which normally means 3' +
            ' an extra point is added because the ' +
            'dictionary doesn\'t know the word 帛');
    });
});
