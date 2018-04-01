/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game';
import { connect } from 'preact-redux';
import FlashCard from './Card';
import GameMatchPairs from './GameMatchPairs';
import ExhaustedDeck from './ExhaustedDeck';
import GameSelection from './GameSelection';
import DeckSelection from './DeckSelection';
import GameMatchSound from './GameMatchSound';
import ProgressBar from './ProgressBar';
import CharacterOverlay from './CharacterOverlay';
import BootScreen from './BootScreen';
import Button from './Button';
import { getKnownWordCount, getUnKnownWordCount } from './../helpers/difficulty-ratings';
import { dismountCurrentGame, dismountDeck } from './../actions';
import { MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    MATCH_SOUND,
    DECK_NEW,
    DECK_UNKNOWN
} from './../constants';
import logoUrl from './logo.png';

class App extends Component {
    clearOverlay() {
        this.setState({ overlay: undefined });
    }
    onHighlightedCardClick(ev, props) {
        ev.stopPropagation();
        this.setState({
            overlay: (
                <CharacterOverlay {...props}>
                    <Button className='app__overlay__button'
                        onClick={this.clearOverlay.bind(this)}>Got it!</Button>
                </CharacterOverlay>
            )
        });
    }
    render(props) {
        let workflow;
        const onHighlightedCardClick = this.onHighlightedCardClick.bind(this);
        const game = props.game;
        let gameDescription;
        switch (props.deck) {
            case DECK_NEW:
                gameDescription = `Here are some cards I\'d like to show.
                    Click and tick the ones you know.`;
                break;
            case DECK_UNKNOWN:
                gameDescription = 'You struggled with these cards. Any change?';
                break;
            default:
                gameDescription = 'Do you remember these?';
                break;
        }

        const isDeckEmpty = props.isDeckEmpty;
        if (!props.isBooted) {
            workflow = <BootScreen className='app__content' />;
        } else if (game && !isDeckEmpty) {
            workflow = (
                <div className='app__content'>
                    { (game === REVISE) &&
                        <Game description={gameDescription} /> }
                    { (game === MATCH_PAIRS)
                        && <GameMatchPairs /> }
                    { (game === PINYIN_TO_CHINESE) && <GameMatchPairs mode={2} /> }
                    { (game === ENGLISH_TO_CHINESE) && <GameMatchPairs mode={1} /> }
                    { (game === MATCH_SOUND)
                        && <GameMatchSound /> }
                </div>
            );
        } else if (game && isDeckEmpty) {
            workflow = (
                <div className='app__content'>
                    <ExhaustedDeck />
                </div>
            );
        } else if (props.deck) {
            workflow = <GameSelection />;
        } else {
            const isNewWordsAvailable = props.maxSize - props.knownWordCount -
              props.unknownWordCount > 0;
            workflow = <DeckSelection
                isNewWordsAvailable={isNewWordsAvailable}
                isDifficultWordsAvailable={props.unknownWordCount < props.maxSize}
                isFamiliarWordsAvailable={props.knownWordCount > 0}
                maxSize={props.maxSize}
            />;
        }

        return (
            <div className='app'>
                {this.state && this.state.overlay}
                <div className='app__header'>
                    <div className='app__header__home'>
                        <Button onClick={() => { props.onBackClick(props); }}
                            disabled={props.isPaused || !props.deck}>Back</Button>
                        <img src={logoUrl} alt='Divide and concur'
                            width='220'
                            className='app__header__home__logo'
                        />
                    </div>
                    <div className='app__component--floated'>
                        {
                            props.maxSize &&
                            <ProgressBar known={props.knownWordCount} total={props.maxSize}
                                unknown={props.unknownWordCount} />
                        }
                    </div>
                    <div className='app__component--floated'>
                        {
                            props.isBooted && props.highlighted.map((props) => {
                                return <FlashCard {...props} isHighlighted
                                    onClick={onHighlightedCardClick}
                                    key={`card-highlighted-${props.character}`} isSmall />;
                            })
                        }
                    </div>
                </div>
                {workflow}
            </div>
        );
    }
}

App.defaultProps = {};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onBackClick:(props) => {
            if (props.game) {
                dispatch(dismountCurrentGame());
            } else if (props.deck) {
                dispatch(dismountDeck());
            }
        }
    };
};

const mapStateToProps = (state, props) => {
    const {
        isPaused,
        isBooted,
        highlighted,
        game,
        deck,
        overlay,
        cards,
        words,
        answers
    } = state;

    let maxSize;

    if (words) {
        maxSize = words.length;
    }
    const knownWordCount = getKnownWordCount(answers);
    // While we're building out the game it's possible I've removed words from the game
    // that are included in unknown word count.
    const unknownWordCount = Math.min(maxSize - knownWordCount, getUnKnownWordCount(answers));
    return Object.assign({}, props, {
        isBooted,
        isDeckEmpty: cards === undefined ? true : cards.length === 0,
        highlighted: highlighted || [],
        isPaused,
        game,
        deck,
        overlay,
        unknownWordCount,
        knownWordCount,
        maxSize  });
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
