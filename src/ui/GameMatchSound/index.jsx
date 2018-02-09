/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card'
import { connect } from 'preact-redux';
import { endRound, timedAction } from './../../actions'
import './styles.less'

class GameDecompose extends Component {
  componentWillUpdate(props) {
    // if all cards frozen and answered.. then trigger end round
    if ( props.onFinished && this.isFinished(props)) {
      props.onFinished();
    }
  }
  isFinished(props) {
    return props.goal.length === props.cards.filter(card=>card.isAnswered).length;
  }
  render(props) {
    return (
        <div className="game-decompose">
          <p>Match the card with its sound!</p>
          <Card {...props.card} isLarge={true} isSelected={this.isFinished(props)}
            pinyin={false} isFrozen={true} debug={false} />
          {
            props.cards.map((cardProps) => {
              return <Card {...cardProps} isSmall={true} label={cardProps.pinyin}
                selectedControls={false}
                english={false} debug={false} />
            })
          }
          <div className="game-decompose__end-marker"></div>
        </div>
      );
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    onFinished: () => {
      dispatch(endRound());
    }
  };
};

const mapStateToProps = (state, props) => {
  const {
    card,
    goal,
    cards
  } = state;

  return Object.assign( {}, props, { cards, card, goal } );
};

export default connect( mapStateToProps, mapDispatchToProps )(GameDecompose);