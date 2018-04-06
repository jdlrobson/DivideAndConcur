import { endRound, startRound, dismountDeck } from './../src/actions';
import actionTypes from './../src/actionTypes';
import { MATCH_SOUND, DECK_UNKNOWN, DECK_KNOWN, DECK_NEW } from './../src/constants';
import assert from 'assert';
import sinon from 'sinon';

const words = [
    { character: 'a' },
    { character: 'b' },
    { character: 'c' }
]
describe('actions', () => {
    it('endRound - noop if endRound already being processed', () => {
        const getState = () => ({
            endRound: true
        });
        const timeoutSpy = sinon.spy(setTimeout);
        const dispatch = sinon.spy();
        endRound( timeoutSpy )(dispatch, getState);
        assert.ok( timeoutSpy.notCalled );
        assert.ok( dispatch.notCalled );
    });
    it('endRound - if unknown deck is exhausted dismount', () => {
        const getState = () => ({
            words,
            game: MATCH_SOUND,
            deck: DECK_UNKNOWN,
            answers: {
                b: -1
            }
        });
        const setTimeoutSync = (fn) => fn();
        const dispatch = sinon.spy();
        endRound( setTimeoutSync )(dispatch, getState);
        assert.ok( dispatch.calledWith( dismountDeck() ) );
    });
    it('endRound - if known deck is exhausted dismount', () => {
        const getState = () => ({
            words,
            game: MATCH_SOUND,
            deck: DECK_KNOWN,
            answers: {
                b: 1
            }
        });
        const setTimeoutSync = (fn) => fn();
        const dispatch = sinon.spy();
        endRound( setTimeoutSync )(dispatch, getState);
        assert.ok( dispatch.calledWith( dismountDeck() ) );
    });
    it('endRound - if all words are answered and in NEW deck dismount', () => {
        const getState = () => ({
            words,
            game: MATCH_SOUND,
            deck: DECK_NEW,
            answers: {
                b: 1,
                a: 1,
                c: 1
            }
        });
        const setTimeoutSync = (fn) => fn();
        const dispatch = sinon.spy();
        endRound( setTimeoutSync )(dispatch, getState);
        // Note there is a random element to this test.
        assert.ok( dispatch.calledWith( dismountDeck() ) );
    });
});
