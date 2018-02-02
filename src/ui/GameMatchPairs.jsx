/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card'
import GameDescription from './GameDescription'
import { flipCardsAfter } from './../actions'
import { startRound } from './../actions'

class GameMatchPairs extends Component {
  componentDidMount() {
    this.props.onStart();
  }
  render(props) {
    const cards = props.cards;
    const msg = props.isFlipped ?
      'Match the pairs to win the cards!' :
      'The cards will be flipped soon! Try and remember their locations!';

    return (
      <div className="game-match-pairs">
      <GameDescription>{msg}</GameDescription>
      {
        cards.map((card) => <Card isSelected={true} {...card}/> )
      }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { cards, isFlipped } = state;

  return Object.assign( {}, props, { cards, isFlipped } );
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onStart: () => {
      dispatch(startRound());
      dispatch(flipCardsAfter(5000));
    }
  };
};

export default connect( mapStateToProps, mapDispatchToProps )(GameMatchPairs);
