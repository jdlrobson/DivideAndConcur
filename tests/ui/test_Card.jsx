import chai, { expect } from 'chai';
import { Card } from './../../src/ui/Card';
import assertJsx from 'preact-jsx-chai';
import { h } from 'preact'; /** @jsx h */

chai.use(assertJsx);

describe('Card', () => {
    it('if two characters a card is wide', () => {
        const card = <Card character='国语' isSmall={true} />;
        expect(
            card
        ).to.contain(
            'card--small'
        );
        expect(
            card
        ).to.contain(
            'card--wide'
        );
    });
    it('special haracters with string length greater than 1 are not wide', () => {
        const card = <Card character='𥫗' isSmall={true} />;
        expect(
            card
        ).to.contain(
            'card card--small'
        );
        expect(
            card
        ).to.not.contain(
            'card--wide'
        );
    });
});
