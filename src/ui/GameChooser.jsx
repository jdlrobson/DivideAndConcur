/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game'
import { connect } from 'preact-redux';
import GameMatchPairs from './GameMatchPairs'
import ProgressBar from './ProgressBar'

import actionTypes from './../actionTypes';

export const MATCH_PAIRS = 'pairs';
export const FLIP_CARDS = 'flip';
export const REVISE = 'revise';

class GameChooser extends Component {
  setGame( game ) {
    this.props.setGame( game );
  }
  render(props) {
    const game = props.game;

    return (
      <div className="game-chooser" onCanvasClick={props.onCanvasClick}>
        {props.overlay}
        <ProgressBar percent={(props.knownWordCount/props.maxSize) * 100}>
          {`${props.knownWordCount} of ${props.maxSize} words`}
        </ProgressBar>
        <div>
          <button disabled={game === FLIP_CARDS} onClick={(ev)=>this.setGame( FLIP_CARDS )}>Flip</button>
          <button disabled={game === MATCH_PAIRS} onClick={(ev)=>this.setGame( MATCH_PAIRS )}>Pairs</button>
          <button disabled={game === REVISE} onClick={(ev)=>this.setGame( REVISE )}>Revise</button>
        </div>
        { ( game === FLIP_CARDS || game === REVISE ) && <Game /> }
        { game === MATCH_PAIRS && <GameMatchPairs /> }
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
      dispatch( actionTypes.CLICK_ROOT_NODE );
    },
    setGame: ( game ) => {
      dispatch({ type: actionTypes.SWITCH_GAME.type, game });
    }
  };
};

const mapStateToProps = (state, props) => {
  const {
    game,
    overlay,
    knownWordCount,
    maxSize
  } = state;

  return Object.assign( {}, props, { game, overlay, knownWordCount, maxSize } );
};

export default connect( mapStateToProps, mapDispatchToProps )(GameChooser);