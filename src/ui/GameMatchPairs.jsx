/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card'
import { flipCardsAfter } from './../actions'
import actionTypes from './../actionTypes';

class GameMatchPairs extends Component {
  componentDidMount() {
    console.log('GameMatchPairs mounted');
    this.props.onStart();
  }
  render(props) {
    const cards = props.cards;

    return (
      <div className="game-match-pairs">
      {
        cards.map((card) => <Card isSelected={true} {...card}/> )
      }
      </div>
    )
  }
}

const mapStateToProps = (state, props) => {
  const { cards } = state;

  return Object.assign( {}, props, { cards } );
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onStart: () => {
      dispatch(actionTypes.START_ROUND);
      dispatch(flipCardsAfter(5000));
    }
  };
};

export default connect( mapStateToProps, mapDispatchToProps )(GameMatchPairs);
