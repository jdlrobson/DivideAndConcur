/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import { switchGame } from './../../actions'
import { MATCH_PAIRS, FLIP_CARDS, REVISE, MATCH_PAIRS_REVISE,
   MATCH_SOUND } from './../../constants'
import './styles.less'

class GameSelection extends Component {
  setGame( game ) {
    this.props.setGame( game );
  }
  render(props) {
    const game = props.game;
    let revise = [];
    if ( props.knownWordCount > 0 ) {
        revise = [
          <h2>Remember old words</h2>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( REVISE )}>Test and click</button>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_PAIRS_REVISE )}>Pairs</button>
        ];
    }
    return (
        <div className="game-selection">
          <p>How would you like to play today?</p>
          <h2>Learn new words</h2>
          <button
              className="game-selection__button"
              onClick={(ev)=>this.setGame( FLIP_CARDS )}>Test and click</button>
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_PAIRS )}>Pairs</button>
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_SOUND )}>How's that sound?</button>
          {revise}
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
    game,
    knownWordCount
  } = state;

  return Object.assign( {}, props, { game, knownWordCount } );
};

export default connect( mapStateToProps, mapDispatchToProps )(GameSelection);