import { connect } from 'preact-redux';
import { DECK_NEW, DECK_START } from './../constants';
import { flipCardsAfter, answerFlashcard } from './../actions';
import MatchPairs from './MatchPairs';

const mapStateToProps = (state, props) => {
    const { cards, isFlipped, deck, countdown } = state;
    let delayStart = 5000;
    let showHint = false;
    switch (deck) {
        case DECK_START:
            showHint = true;
            break;
        case DECK_NEW:
            delayStart = 10000;
            break;
        default:
            break;
    }

    return Object.assign({}, props, { cards,
        isFlipped,
        delayStart,
        countdown,
        showHint });
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onIncorrect: () => {
            dispatch(flipCardsAfter(1000));
        },
        onCorrect: (char) => {
            dispatch(answerFlashcard(true, char, false));
        },
        onStart: (delay) => {
            dispatch(flipCardsAfter(delay || 10000));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MatchPairs);
