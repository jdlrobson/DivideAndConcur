/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game';
import { connect } from 'preact-redux';
import FlashCard, { Card } from './Card';
import GameMatchPairs from './GameMatchPairs';
import GameSelection from './GameSelection';
import GameMatchSound from './GameMatchSound';
import ProgressBar from './ProgressBar';
import BootScreen from './BootScreen';
import { getKnownWordCount } from './../helpers/difficulty-ratings';
import { dismountCurrentGame } from './../actions';
import { MATCH_PAIRS, FLIP_CARDS, REVISE, MATCH_PAIRS_REVISE,
    PINYIN_HARD, PINYIN_REVISE,
    REVISE_HARD, MATCH_PAIRS_HARD,
    MATCH_SOUND } from './../constants';

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
        const gameDescription = game === FLIP_CARDS ?
            'Here are some cards. Do you know them? Click to see!' :
            'You got these cards right already. Can you remember them?';

        if (!props.isBooted) {
            workflow = <BootScreen className='app__content' />;
        } else if (game) {
            workflow = (
                <div className='app__content'>
                    { (game === FLIP_CARDS || game === REVISE || game === REVISE_HARD) &&
                        <Game description={gameDescription} /> }
                    { (game === MATCH_PAIRS || game === MATCH_PAIRS_REVISE ||
                        game === MATCH_PAIRS_HARD)
                        && <GameMatchPairs /> }
                    { (game === MATCH_SOUND || game === PINYIN_HARD || game === PINYIN_REVISE)
                        && <GameMatchSound /> }
                </div>
            );
        } else {
            workflow = <GameSelection knownWordCount={props.knownWordCount} />;
        }

        return (
            <div className='app'>
                {this.state && this.state.overlay}
                <div className='app__header'>
                    <div className='app__header__home'>
                        <button onClick={props.onHomeClick}
                            disabled={props.switcherDisabled || !game}>Home</button>
                    </div>
                    <div className='app__component--floated'>
                        {
                            props.maxSize &&
                <ProgressBar percent={(props.knownWordCount / props.maxSize) * 100}>
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
        overlay,
        words,
        answers
    } = state;

    let maxSize;

    if (words) {
        maxSize = words.length;
    }
    const knownWordCount = getKnownWordCount(answers);
    return Object.assign({}, props, {
        isBooted,
        highlighted: highlighted || [],
        switcherDisabled: isPaused,
        game,
        overlay,
        knownWordCount,
        maxSize  });
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
