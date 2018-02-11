/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import { switchGame, startRound } from './../../actions'
import { MATCH_PAIRS, FLIP_CARDS, REVISE, MATCH_PAIRS_REVISE,
    ENGLISH_TO_CHINESE, PINYIN_TO_CHINESE,
    REVISE_HARD, MATCH_PAIRS_HARD, PINYIN_HARD, PINYIN_REVISE,
    MATCH_SOUND } from './../../constants'
import Button from './../Button'
import ButtonGroup from './../ButtonGroup'

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
          <Button
            onClick={(ev)=>this.setGame( REVISE_HARD )}>Revise</Button>,
          <Button
            onClick={(ev)=>this.setGame( MATCH_PAIRS_HARD )}>Pairs</Button>,
          <Button
            onClick={(ev)=>this.setGame( PINYIN_HARD )}>Learn Pinyin</Button>,
          <h2>Remember old words</h2>,
          <Button
            onClick={(ev)=>this.setGame( REVISE )}>Revise</Button>,
          <Button
            onClick={(ev)=>this.setGame( MATCH_PAIRS_REVISE )}>Pairs</Button>,
          <Button
            onClick={(ev)=>this.setGame( PINYIN_REVISE )}>Learn Pinyin</Button>
        ];
    }
    return (
        <ButtonGroup>
          <p>How would you like to play today?</p>
          <h2>Review unfamiliar words</h2>
          <Button onClick={(ev)=>this.setGame( FLIP_CARDS )}>Revise</Button>
          <Button
            onClick={(ev)=>this.setGame( MATCH_PAIRS )}>Pairs</Button>
          <Button
            onClick={(ev)=>this.setGame( MATCH_SOUND )}>Learn Pinyin</Button>
          <Button
            onClick={(ev)=>this.setGame(  ENGLISH_TO_CHINESE )}>English&lt;-&gt;Pinyin</Button>
          <Button
            onClick={(ev)=>this.setGame( PINYIN_TO_CHINESE )}>Simplified&lt;-&gt;Pinyin</Button>
          {revise}
        </ButtonGroup>
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