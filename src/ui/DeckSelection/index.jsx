/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import { setDeck } from './../../actions';
import { DECK_NEW, DECK_KNOWN, DECK_UNKNOWN,
    ALLOW_DECK_SELECTION
} from './../../constants';
import { random } from './../../utils';
import Button from './../Button';
import ButtonGroup from './../ButtonGroup';

import './styles.less';

class DeckSelection extends Component {
    componentDidMount() {
        if (!ALLOW_DECK_SELECTION) {
            const props = this.props;
            const options = [];
            if (props.isNewWordsAvailable) {
                options.push(DECK_NEW);
            }
            if (props.isDifficultWordsAvailable) {
                options.push(DECK_UNKNOWN);
            }
            if (props.isFamiliarWordsAvailable) {
                options.push(DECK_KNOWN);
            }
            // auto-choose deck
            props.setDeck(random(options));
        }
    }
    render(props) {
        return ALLOW_DECK_SELECTION ? (
            <ButtonGroup>
                <p>How would you like to play today?</p>
                {
                    props.isNewWordsAvailable &&
                <Button onClick={ev => props.setDeck(DECK_NEW)}>New words</Button>
                }
                {
                    props.isDifficultWordsAvailable &&
                <Button onClick={ev => props.setDeck(DECK_UNKNOWN)}
                    disabled={props.knownWordCount === 0}>Difficult words</Button>
                }
                {
                    props.isFamiliarWordsAvailable &&
                <Button onClick={ev => props.setDeck(DECK_KNOWN)}
                    disabled={props.knownWordCount === 0}>Familiar words</Button>
                }
            </ButtonGroup>
        ) :
            (
                <div className={props.className}>
            Choosing a deck...
                </div>
            );
    }
}

const mapDispatchToProps = (dispatch, props) => {
    return {
        setDeck: (deck) => {
            dispatch(setDeck(deck));
        }
    };
};

export default connect(undefined, mapDispatchToProps)(DeckSelection);
