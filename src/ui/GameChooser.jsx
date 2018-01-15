/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game'
import GameMatchPairs from './GameMatchPairs'
import ProgressBar from './ProgressBar'

export const MATCH_PAIRS = 'pairs';
export const FLIP_CARDS = 'flip';
export const REVISE = 'revise';

export default class GameChooser extends Component {
  refresh() {
    this.setState( this.props.store.getState() );
  }
  componentWillMount() {
    // On any change in global state re-render.
    this.props.store.subscribe( this.refresh.bind( this ) );
  }
  setGame( game ) {
    this.props.dispatch( { type: this.props.actionTypes.SWITCH_GAME.type, game } );
  }
  render(props) {
    const state = this.state || {};
    const game = state.game || props.game;

    return (
      <div className="game-chooser">
        {state.overlay}
        <ProgressBar percent={(state.knownWordCount/state.maxSize) * 100}>
          {`${state.knownWordCount} of ${state.maxSize} words`}
        </ProgressBar>
        <div>
          <button disabled={game === FLIP_CARDS} onClick={(ev)=>this.setGame( FLIP_CARDS )}>Flip</button>
          <button disabled={game === MATCH_PAIRS} onClick={(ev)=>this.setGame( MATCH_PAIRS )}>Pairs</button>
          <button disabled={game === REVISE} onClick={(ev)=>this.setGame( REVISE )}>Revise</button>
        </div>
        { ( game === FLIP_CARDS || game === REVISE ) && <Game {...props} {...state} /> }
        { game === MATCH_PAIRS && <GameMatchPairs {...props} {...state} /> }
      </div>
    );
  }
}
GameChooser.defaultProps = {
  game: FLIP_CARDS
}
