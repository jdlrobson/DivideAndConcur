/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game'
import { connect } from 'preact-redux';
import Card from './Card'
import GameMatchPairs from './GameMatchPairs'
import ProgressBar from './ProgressBar'
import actionTypes from './../actionTypes';

export const MATCH_PAIRS = 'pairs';
export const FLIP_CARDS = 'flip';
export const REVISE = 'revise';
export const PAUSED = 'paused';

class GameChooser extends Component {
  setGame( game ) {
    this.props.setGame( game );
  }
  render(props) {
    const game = props.game;
    const switcherDisabled = props.switcherDisabled;

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
              props.highlighted.map((char) => {
                return <Card isHighlighted={true}
                  key={'card-highlighted-' + char} character={char} isSmall={true} />;
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
        { ( game === FLIP_CARDS || game === REVISE ) && <Game /> }
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
      dispatch( actionTypes.CLICK_ROOT_NODE );
    },
    setGame: ( game ) => {
      dispatch({ type: actionTypes.SWITCH_GAME.type, game });
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