/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card'

class GameMatchPairs extends Component {
  componentDidMount() {
    this.props.onStart();
  }
  render(props) {
    const cards = props.cards;

    return (
      <div>
      {
        cards.map((card) => <Card isSelected={true} {...props} {...card}/> )
      }
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    onStart: () => {
      dispatch(props.actionTypes.START_ROUND)
    }
  };
};

export default connect( null, mapDispatchToProps )(GameMatchPairs);
