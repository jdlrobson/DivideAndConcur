/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import { switchGame, startRound } from './../../actions'
import { MATCH_PAIRS, FLIP_CARDS, REVISE, MATCH_PAIRS_REVISE,
    ENGLISH_TO_CHINESE,
    REVISE_HARD, MATCH_PAIRS_HARD, PINYIN_HARD, PINYIN_REVISE,
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
          <h2>Review hard words</h2>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( REVISE_HARD )}>Revise</button>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_PAIRS_HARD )}>Pairs</button>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( PINYIN_HARD )}>Learn Pinyin</button>,
          <h2>Remember old words</h2>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( REVISE )}>Revise</button>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_PAIRS_REVISE )}>Pairs</button>,
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( PINYIN_REVISE )}>Learn Pinyin</button>
        ];
    }
    return (
        <div className="game-selection">
          <p>How would you like to play today?</p>
          <h2>Review unfamiliar words</h2>
          <button
              className="game-selection__button"
              onClick={(ev)=>this.setGame( FLIP_CARDS )}>Revise</button>
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_PAIRS )}>Pairs</button>
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame( MATCH_SOUND )}>Learn Pinyin</button>
          <button
            className="game-selection__button"
            onClick={(ev)=>this.setGame(  ENGLISH_TO_CHINESE )}>English&lt;-&gt;Pinyin</button>,
          {revise}
        </div>
      );
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    setGame: ( game ) => {
      dispatch(switchGame(game));
      dispatch(startRound());
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