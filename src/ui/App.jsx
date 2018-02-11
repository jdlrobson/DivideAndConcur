/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game';
import { connect } from 'preact-redux';
import FlashCard, { Card } from './Card';
import GameMatchPairs from './GameMatchPairs';
import GameSelection from './GameSelection';
import DeckSelection from './DeckSelection';
import GameMatchSound from './GameMatchSound';
import ProgressBar from './ProgressBar';
import BootScreen from './BootScreen';
import Button from './Button';
import { getKnownWordCount, getUnKnownWordCount } from './../helpers/difficulty-ratings';
import { dismountCurrentGame } from './../actions';
import { MATCH_PAIRS, REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    MATCH_SOUND,
    DECK_NEW
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
                <div className='app__overlay'>
                    <FlashCard {...props} isLarge isSmall={false} isFrozen
                        isSelected
                        className='app__overlay__card' />
                    <button className='app__overlay__button'
                        onClick={this.clearOverlay.bind(this)}>Got it!</button>
                </div>
            )
        });
    }
    render(props) {
        let workflow;
        const onHighlightedCardClick = this.onHighlightedCardClick.bind(this);
        const game = props.game;
        const gameDescription = props.deck === DECK_NEW ?
            'Here are some cards. Do you know them? Click to see!' :
            'You\'ve seen these cards before. Can you remember them?';

        if (!props.isBooted) {
            workflow = <BootScreen className='app__content' />;
        } else if (game) {
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
        } else if (props.deck) {
            workflow = <GameSelection />;
        } else {
            workflow = <DeckSelection knownWordCount={props.knownWordCount} />;
        }

        return (
            <div className='app'>
                {this.state && this.state.overlay}
                <div className='app__header'>
                    <div className='app__header__home'>
                        <Button onClick={props.onHomeClick}
                            disabled={props.isPaused || !props.deck}>Home</Button>
                        <img src={logoUrl} alt="Divide and concur"
                            width="220"
                            className="app__header__home__logo"
                        />
                    </div>
                    <div className='app__component--floated'>
                        {
                            props.maxSize &&
                <ProgressBar percent={(props.knownWordCount / props.maxSize) * 100}
                    percentRed={(props.unknownWordCount / props.maxSize) * 100}
                >
                    {`${props.knownWordCount} of ${props.maxSize} words`}
                </ProgressBar>
                        }
                    </div>
                    <div className='app__component--floated'>
                        {
                            props.isBooted && props.highlighted.map((props) => {
                                return <FlashCard {...props} isHighlighted
                                    onClick={onHighlightedCardClick}
                                    key={`card-highlighted-${props.character}`} isSmall />;
                            }).concat(
                                Array(2 - props.highlighted.length).fill()
                                    .map(() => <Card isSmall />)
                            )
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
        onHomeClick:() => {
            dispatch(dismountCurrentGame());
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
        words,
        answers
    } = state;

    let maxSize;

    if (words) {
        maxSize = words.length;
    }
    const knownWordCount = getKnownWordCount(answers);
    const unknownWordCount = getUnKnownWordCount(answers);
    return Object.assign({}, props, {
        isBooted,
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
