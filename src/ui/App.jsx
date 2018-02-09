/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game';
import { connect } from 'preact-redux';
import Card from './Card';
import GameMatchPairs from './GameMatchPairs';
import GameSelection from './GameSelection';
import GameMatchSound from './GameMatchSound';
import ProgressBar from './ProgressBar';
import BootScreen from './BootScreen';
import { clickRootNode, switchGame, dismountCurrentGame } from './../actions';
import { MATCH_PAIRS, FLIP_CARDS, REVISE, MATCH_PAIRS_REVISE,
    MATCH_SOUND } from './../constants';

class App extends Component {
    setGame(game) {
        this.props.setGame(game);
    }
    clearOverlay() {
        this.setState({ overlay: undefined });
    }
    onHighlightedCardClick(ev, props) {
        ev.stopPropagation();
        this.setState({
            overlay: (
                <div className='app__overlay'>
                    <Card {...props} isLarge isSmall={false} isFrozen
                        isSelected className='app__overlay__card' />
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
                    { (game === FLIP_CARDS || game === REVISE) &&
                        <Game description={gameDescription} /> }
                    { (game === MATCH_PAIRS || game === MATCH_PAIRS_REVISE) && <GameMatchPairs /> }
                    { (game === MATCH_SOUND) && <GameMatchSound /> }
                </div>
            );
        } else {
            workflow = <GameSelection />;
        }

        return (
            <div className='app' onClick={props.onCanvasClick}>
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
                            props.highlighted.map((props) => {
                                return <Card {...props} isHighlighted
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
        onHomeClick:() => {
            dispatch(dismountCurrentGame());
        },
        onCanvasClick: () => {
            dispatch(clickRootNode());
        },
        setGame: (game) => {
            dispatch(switchGame(game));
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
        knownWordCount
    } = state;

    let maxSize;

    if (words) {
        maxSize = words.length;
    }
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
