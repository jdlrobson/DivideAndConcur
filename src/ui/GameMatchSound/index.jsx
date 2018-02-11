/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card'
import { connect } from 'preact-redux';
import { endRound } from './../../actions'
import './styles.less'

class GameDecompose extends Component {
  componentWillUpdate(props) {
    // if all cards frozen and answered.. then trigger end round
    if ( props.onFinished && this.isFinished(props)) {
      props.onFinished();
    }
  }
  isFinished(props) {
    return props.cards.slice(1).filter(card=>card.isAnswered).length === 1;
  }
  render(props) {
      const card = props.cards[0];
    return (
        <div className="game-decompose">
          <p>Match the card with its sound!</p>
          <Card {...card} isLarge={true} isSelected={this.isFinished(props)}
              pinyin={this.isFinished(props) ? false : card.pinyin} isFrozen={true} debug={false} />
          {
            props.cards.slice(1).map((cardProps) => {
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