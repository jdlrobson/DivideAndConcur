/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'

export default class GameMatchPairs extends Component {
  componentDidMount() {
    this.props.dispatch( this.props.actionTypes.START_ROUND );
  }
  render(props) {
    const cards = props.cards;

    return (
      <div>
      {
        cards.map((card) => <Card {...props} {...card} isFlipped={true} /> )
      }
      </div>
    )
  }
}
