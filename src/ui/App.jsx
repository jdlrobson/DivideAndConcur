/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game'
import { connect } from 'preact-redux';
import Card from './Card'
import GameMatchPairs from './GameMatchPairs'
import GameSelection from './GameSelection'
import ProgressBar from './ProgressBar'
import { clickRootNode, switchGame, dismountCurrentGame } from './../actions'
import { MATCH_PAIRS, FLIP_CARDS, REVISE } from './../constants'

class App extends Component {
  setGame( game ) {
    this.props.setGame( game );
  }
  render(props) {
    let workflow;
    const game = props.game;
    const gameDescription = game === FLIP_CARDS ?
      'See if you know these cards. Click and tick the ones you know and cross the ones you don\'t.' :
      'You got these cards right already. Can you remember them?'

    if ( game ) {
      workflow = (
          <div className="app__content">
          { ( game === FLIP_CARDS || game === REVISE ) && <Game description={gameDescription} /> }
          { game === MATCH_PAIRS && <GameMatchPairs /> }
          </div>
      );
    } else {
      workflow = <GameSelection />
    }
    return (
      <div className="app" onClick={props.onCanvasClick}>
        {props.overlay}
        <div className="app__header">
          <div className="app__component--floated">
            <button onClick={props.onHomeClick} disabled={props.switcherDisabled}>Home</button>
          </div>
          <div className="app__component--floated">
            <ProgressBar percent={(props.knownWordCount/props.maxSize) * 100}>
              {`${props.knownWordCount} of ${props.maxSize} words`}
            </ProgressBar>
          </div>
          <div className="app__component--floated">
            {
              props.highlighted.map((props) => {
                return <Card {...props} isHighlighted={true}
                  key={'card-highlighted-' + props.character} isSmall={true} />;
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
    setGame: ( game ) => {
      dispatch(switchGame(game));
    }
  };
};

const mapStateToProps = (state, props) => {
  const {
    isPaused,
    highlighted,
    game,
    overlay,
    knownWordCount,
    maxSize
  } = state;

  return Object.assign( {}, props, {
      highlighted: highlighted || [],
      switcherDisabled: isPaused, game,
      overlay, knownWordCount, maxSize } );
};

export default connect( mapStateToProps, mapDispatchToProps )(App);