/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game'
import { connect } from 'preact-redux';
import Card from './Card'
import GameMatchPairs from './GameMatchPairs'
import ProgressBar from './ProgressBar'
import { clickRootNode, switchGame } from './../actions'
import { MATCH_PAIRS, FLIP_CARDS, REVISE } from './../constants'

class GameChooser extends Component {
  setGame( game ) {
    this.props.setGame( game );
  }
  render(props) {
    const game = props.game;
    const switcherDisabled = props.switcherDisabled;
    const gameDescription = game === FLIP_CARDS ?
      'See if you know these cards. Click and tick the ones you know and cross the ones you have forgotten.' :
      'You got these cards right already. Can you remember them?'

    return (
      <div className="game-chooser" onClick={props.onCanvasClick}>
        {props.overlay}
        <div className="game-chooser__header">
          <div className="game-chooser__component--floated">
            <ProgressBar percent={(props.knownWordCount/props.maxSize) * 100}>
              {`${props.knownWordCount} of ${props.maxSize} words`}
            </ProgressBar>
          </div>
          <div className="game-chooser__component--floated">
            {
              props.highlighted.map((props) => {
                return <Card {...props} isHighlighted={true}
                  key={'card-highlighted-' + props.character} isSmall={true} />;
              })
            }
          </div>
        </div>
        <div className="game-chooser__menu">
          <button disabled={game === FLIP_CARDS || switcherDisabled}
              onClick={(ev)=>this.setGame( FLIP_CARDS )}>Flip</button>
          <button disabled={game === MATCH_PAIRS || switcherDisabled}
            onClick={(ev)=>this.setGame( MATCH_PAIRS )}>Pairs</button>
          <button disabled={game === REVISE || switcherDisabled}
            onClick={(ev)=>this.setGame( REVISE )}>Revise</button>
        </div>
        <div className="game-chooser__content">
        { ( game === FLIP_CARDS || game === REVISE ) && <Game description={gameDescription} /> }
        { game === MATCH_PAIRS && <GameMatchPairs /> }
        </div>
      </div>
    );
  }
}

GameChooser.defaultProps = {
  game: FLIP_CARDS
}

const mapDispatchToProps = (dispatch, props) => {
  return {
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

export default connect( mapStateToProps, mapDispatchToProps )(GameChooser);