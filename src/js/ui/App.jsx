/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game';
import { connect } from 'preact-redux';
import GameMatchPairs from './GameMatchPairs';
import ExhaustedDeck from './ExhaustedDeck';
import GameSelection from './GameSelection';
import DeckSelection from './DeckSelection';
import GameOneInFour from './GameOneInFour';
import ProgressBar from './ProgressBar';
import TakeBreak from './TakeBreak';
import Overlay from './Overlay';
import AboutOverlay from './AboutOverlay';
import CharacterOverlay from './CharacterOverlay';
import Button from './Button';
import { getAnsweredCards, maxSize } from './../helpers/cards';
import { getKnownWordCount, getUnKnownWordCount } from './../helpers/difficulty-ratings';
import { dismountCurrentGame, dismountDeck, refresh,
    hideOverlay, showOverlay
} from './../actions';
import { MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    MATCH_SOUND, MATCH_DEFINITION,
    TAKE_A_BREAK,
    DECK_NEW,
    DECK_UNKNOWN,
    ALLOW_DECK_SELECTION
} from './../constants';

function makeOverlay(data, stackNumber, onHideOverlay) {
    switch (data.overlay) {
        case 'about':
            return <AboutOverlay onClickExit={onHideOverlay}></AboutOverlay>
        case 'character':
        default:
            return (
                <CharacterOverlay {...data} key={`overlay-${stackNumber}`}>
                    <Button className='app__overlay__button'
                        onClick={onHideOverlay}>Got it!</Button>
                </CharacterOverlay>
            );
    }
}

class App extends Component {
    render(props) {
        let workflow;
        const game = props.game;
        let gameDescription;
        switch (props.deck) {
            case DECK_NEW:
                gameDescription = `Here are some cards I'd like to show.
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
        if (game && !isDeckEmpty) {
            workflow = (
                <div className='app__content'>
                    { (game === TAKE_A_BREAK) &&
                        <TakeBreak /> }
                    { (game === REVISE) &&
                        <Game description={gameDescription} /> }
                    { (game === MATCH_PAIRS)
                        && <GameMatchPairs /> }
                    { (game === PINYIN_TO_CHINESE) && <GameMatchPairs mode={2} /> }
                    { (game === ENGLISH_TO_CHINESE) && <GameMatchPairs mode={1} /> }
                    { (game === MATCH_SOUND || game === MATCH_DEFINITION)
                        && <GameOneInFour /> }
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
            workflow = <DeckSelection
                maxSize={props.maxSize}
            />;
        }

        const overlay = props.overlay;
        return (
            <div className='app'>
                {
                    // Return a bunch of empty overlays to give illusion of multiple overlays stacked on top
                    overlay.slice(1).map((_, i) =>
                        <Overlay style={
                            {
                                opacity: 0.8,
                                marginTop: (-3 * overlay.length) + (3 * i)
                            }
                        }/>
                    )
                }
                {overlay.length > 0 && makeOverlay(overlay[0], overlay.length, this.props.onHideOverlay)}
                {
                    props.maxSize &&
                    <ProgressBar known={props.knownWordCount} total={props.maxSize}
                        initialKnown={props.initialState.known}
                        unknown={props.unknownWordCount} />
                }
                <div className='app__header'>
                    { ALLOW_DECK_SELECTION &&
                    <div className='app__header__home'>
                        <Button onClick={() => { props.onBackClick(props); }}
                            disabled={props.isPaused || !props.deck}>Back</Button>
                    </div>
                    }
                </div>
                {workflow}
                <div className='app__content'>
                    {
                        props.hasRefreshButton &&
                           <Button onClick={props.onRefresh}
                               className='app__content__button'>Refresh</Button>
                    }
                </div>
                <div class='app__button' onClick={props.onAboutClick}>about</div>
            </div>
        );
    }
}

App.defaultProps = {};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onRefresh:() => {
            dispatch(refresh());
        },
        onHideOverlay: () => {
            dispatch(hideOverlay());
        },
        onBackClick:(props) => {
            if (props.game) {
                dispatch(dismountCurrentGame());
            } else if (props.deck) {
                dispatch(dismountDeck());
            }
        },
        onAboutClick: (props) => {
            dispatch(showOverlay({ overlay: 'about' }));
        }
    };
};

const mapStateToProps = (state, props) => {
    const {
        isPaused,
        isBooted,
        highlighted,
        initialState,
        game,
        deck,
        seenWords,
        overlay,
        cards,
        answers
    } = state;

    const knownWordCount = getKnownWordCount(answers);
    // While we're building out the game it's possible I've removed words from the game
    // that are included in unknown word count.
    const unknownWordCount = Math.min(maxSize - knownWordCount, getUnKnownWordCount(answers));

    return Object.assign({}, props, {
        isBooted,
        isDeckEmpty: cards === undefined ? true : cards.length === 0,
        highlighted: highlighted || [],
        // Refresh button might confuse new users. To help them learn to click cards
        // don't show it until they are into the swing of the game
        hasRefreshButton: seenWords.length > 10 && game === MATCH_PAIRS &&
            getAnsweredCards({ cards }).length === 0,
        isPaused,
        game,
        deck,
        overlay,
        initialState,
        unknownWordCount,
        knownWordCount,
        maxSize  });
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
