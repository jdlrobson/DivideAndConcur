/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'
import FlashcardRound from './FlashcardRound'
import './game.less'

const NUM_CARDS_PER_LEVEL = 10;

export default class Game extends Component {
  componentDidMount() {
    this.props.dispatch( this.props.actionTypes.START_ROUND );
  }
  onGameClick() {
    this.props.dispatch( this.props.actionTypes.CLICK_ROOT_NODE );
  }
  render(props) {
    const cards = props.cards ? <FlashcardRound {...props} /> : false;
    const loader = <div>Loading up!</div>;
    const prev = props.previous || [];

    return (
      <div className="game" onClick={this.onGameClick.bind(this)}>
      <div className="debug-tools">Level {props.level} [{props.wordSize},{props.difficulty}]</div>
      {cards || loader }
      <h3>Previous history</h3>
      {
        prev.map((cards, i)=>{
          return <FlashcardRound key={'round-' + i}
            {...props} cards={cards} />
        })
      }
      </div>
    );
  }
}
