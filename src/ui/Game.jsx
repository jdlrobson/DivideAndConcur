/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'
import FlashcardRound from './FlashcardRound'
import ProgressBar from './ProgressBar'
import './game.less'

const NUM_CARDS_PER_LEVEL = 10;

export default class Game extends Component {
  constructor() {
    super();
  }
  refresh() {
    this.setState( this.props.store.getState() );
  }
  componentDidMount() {
    // On any change in global state re-render.
    this.props.store.subscribe( this.refresh.bind( this ) );
    this.props.dispatch( this.props.actionTypes.START_ROUND );
  }
  onGameClick() {
    this.props.dispatch( this.props.actionTypes.CLICK_ROOT_NODE );
  }
  render() {
    const props = this.props;
    const state = this.state;
    const cards = state.cards ? <FlashcardRound {...props}
      round={state.round} cards={state.cards} /> : false;
    const loader = <div>Loading up!</div>;
    const prev = state.previous || [];

    return (
      <div className="game" onClick={this.onGameClick.bind(this)}>
      {state.overlay}
      <div className="debug-tools">Level {state.level} [{state.wordSize},{state.difficulty}]</div>
      <ProgressBar percent={(state.knownWordCount/state.maxSize) * 100}>
        {`${state.knownWordCount} of ${state.maxSize} words`}
      </ProgressBar>
      {cards || loader }
      <h3>Previous history</h3>
      {
        prev.map((cards, i)=>{
          return <FlashcardRound key={'round-' + i}
            {...props} cards={cards} round={state.round} />
        })
      }
      </div>
    );
  }
}
