/** @jsx h */
import { Component, h } from 'preact';
import Game from './Game'
import ProgressBar from './ProgressBar'

export const FLIP_CARDS = 'flip';

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
        </div>
        { game === FLIP_CARDS && <Game {...props} {...state} /> }
      </div>
    );
  }
}
GameChooser.defaultProps = {
  game: FLIP_CARDS
}
