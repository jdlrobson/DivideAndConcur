/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card'
import FlashcardRound from './FlashcardRound'
import './game.less'

import actionTypes from './../actionTypes';

const NUM_CARDS_PER_LEVEL = 10;

class Game extends Component {
  componentDidMount() {
    this.props.onStart();
  }
  render(props) {
    const cards = props.cards ? <FlashcardRound cards={props.cards} round={0} /> : false;
    const loader = <div>Loading up!</div>;
    const prev = props.previous || [];

    return (
      <div className="game" onClick={props.onCanvasClick}>
      <div className="debug-tools">Level {props.level}&nbsp;
       [word size = {props.wordSize} difficultyLevel {props.difficulty}]</div>
      {cards || loader }
      {props.previous && props.previous.length && <h3>Previous history</h3>}
      <FlashcardRound key={'round-past'} cards={props.previous} round={1} />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {
    previous,
    level,
    difficulty,
    cards
  } = state;

  return Object.assign( {}, props, {
    previous,
    level,
    difficulty,
    cards
  } );
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onStart: () => {
      dispatch(actionTypes.START_ROUND);
    }
  };
};

export default connect( mapStateToProps, mapDispatchToProps )(Game);
