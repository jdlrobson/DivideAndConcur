/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import { switchGame } from './../../actions'
import { MATCH_PAIRS, FLIP_CARDS, REVISE, MATCH_PAIRS_REVISE } from './../../constants'
import './styles.less'

class GameSelection extends Component {
  setGame( game ) {
    this.props.setGame( game );
  }
  render(props) {
    const game = props.game;
    return (
        <div className="game-selection">
          <p>How would you like to play today?</p>
          <h2>Learn new words</h2>
          <button disabled={game === FLIP_CARDS}
              className="game-selection__button"
              onClick={(ev)=>this.setGame( FLIP_CARDS )}>Flip</button>
          <button disabled={game === MATCH_PAIRS}
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_PAIRS )}>Pairs</button>
          <h2>Remember old words</h2>
          <button disabled={game === REVISE}
            className="game-selection__button"
            onClick={(ev)=>this.setGame( REVISE )}>Flip</button>
          <button disabled={game === MATCH_PAIRS_REVISE}
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_PAIRS_REVISE )}>Pairs</button>
        </div>
      );
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    setGame: ( game ) => {
      dispatch(switchGame(game));
    }
  };
};

const mapStateToProps = (state, props) => {
  const {
    game
  } = state;

  return Object.assign( {}, props, { game } );
};

export default connect( mapStateToProps, mapDispatchToProps )(GameSelection);