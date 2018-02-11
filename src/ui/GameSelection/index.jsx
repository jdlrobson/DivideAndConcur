/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import { switchGame, startRound } from './../../actions';
import { MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE, MATCH_SOUND,
    DECK_NEW, DECK_KNOWN, DECK_UNKNOWN
} from './../../constants';
import Button from './../Button';
import ButtonGroup from './../ButtonGroup';

class GameSelection extends Component {
    setGame(game) {
        this.props.setGame(game);
    }
    render(props) {
        let heading;
        switch (props.deck) {
            case DECK_NEW:
                heading = 'Review new words';
                break;
            case DECK_KNOWN:
                heading = 'Review familiar words';
                break;
            case DECK_UNKNOWN:
            default:
                heading = 'Review unfamiliar words';
        }

        return (
            <ButtonGroup>
                <p>What would you like to play today?</p>
                <h2>{heading}</h2>
                <Button onClick={ev => this.setGame(REVISE)}>Revise</Button>
                <Button
                    onClick={ev => this.setGame(MATCH_PAIRS)}>Pairs</Button>
                <Button
                    onClick={ev => this.setGame(MATCH_SOUND)}>Learn Pinyin</Button>
                <Button
                    onClick={ev => this.setGame(ENGLISH_TO_CHINESE)}>English&lt;-&gt;Pinyin</Button>
                <Button
                    onClick={ev => this.setGame(PINYIN_TO_CHINESE)}
                >Simplified&lt;-&gt;Pinyin</Button>
            </ButtonGroup>
        );
    }
}

const mapDispatchToProps = (dispatch, props) => {
    return {
        setGame: (game) => {
            dispatch(switchGame(game));
            dispatch(startRound());
        }
    };
};

const mapStateToProps = (state, props) => {
    const {
        deck
    } = state;

    return Object.assign({}, props, { deck });
};

export default connect(mapStateToProps, mapDispatchToProps)(GameSelection);
