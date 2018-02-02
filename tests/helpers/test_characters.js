import { TOO_EASY } from './../../src/constants';
import assert from 'assert';
import { removeCharactersThatAreTooEasy } from './../../src/helpers/characters';

describe('Reducer: difficulty-ratings', () => {
    it('removeCharactersThatAreTooEasy', () => {
        const ratings = { A: TOO_EASY - 2, B: TOO_EASY - 2, C: TOO_EASY + 1, D: TOO_EASY + 5 };
        const newChars = removeCharactersThatAreTooEasy(ratings, ['A', 'B', 'C', 'D', 'E' ]);
        assert.ok(newChars.length === 3);
        assert.ok(newChars.indexOf('E') > -1);
    });
});
