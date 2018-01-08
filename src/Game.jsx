/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'
import Memory from './Memory'
import Dictionary from './Dictionary'
import Dealer from './Dealer'
import './game.less'

const NUM_CARDS_PER_LEVEL = 10;

export default class Game extends Component {
  constructor() {
    super();
    this.state = { cards: false, level: 1,
      difficulty: 0, wordSize: 0,
      round: 0 };
  }
  componentWillMount() {
    const props = this.props;
    const storeState = props.store.getState();
    this.memory = storeState.memory;
    this.dictionary = storeState.dictionary;
    this.dealer = storeState.dealer;
  }
  deal() {
    this.props.dispatch( this.props.actionTypes.DEAL_CARDS );
  }
  refresh() {
    this.setState( this.props.store.getState() );
  }
  componentDidMount() {
    // On any change in global state re-render.
    this.props.store.subscribe( this.refresh.bind( this ) );
    this.deal();
  }
  loadDeck(wordSize, wordDifficulty) {
    // Load the dictionary
    this.dealer.load(wordSize, wordDifficulty);
    this.deal();
  }
  componentDidUpdate() {
    const state = this.state;
    const cards = state.cards;

    if ( cards ) {
      if ( !cards.length ) {
        this.loadDeck( state.wordSize, state.difficulty + 1 );
      } else if ( cards.length && state.answered === cards.length ) {
        this.deal();
      }
    }
  }
  onGameClick() {
    this.props.dispatch( this.props.actionTypes.CLICK_ROOT_NODE );
  }
  render() {
    const props = this.props;
    const state = this.state;
    const storeState = this.props.store.getState();
    const memory = this.memory;
    const dictionary = this.dictionary;

    function mapCard( char, events = {} ) {
      const rating = memory.getDifficulty(char);

      return <Card {...events}
        className='card'
        isHighlighted={state.highlighted && state.highlighted.indexOf(char) > -1}
        key={'card-' + char + '-' + state.round}
        difficultyLevel={rating}
        character={char}
        dispatch={props.dispatch}
        actionTypes={props.actionTypes}
        english={dictionary.toEnglish(char)}
      />;
    }
    const cards = state.cards ? state.cards.map(mapCard) : false;
    const loader = <div>Loading up!</div>;
    const prev = state.previous || [];

    return (
      <div className="game" onClick={this.onGameClick.bind(this)}>
      {state.overlay}
      <h2>Level {state.level} [{state.wordSize},{state.difficulty}]</h2>
      <div>Score: {state.score || storeState.score}</div>
      {cards || loader }
      <h3>Previous history</h3>
      {
        prev.map((cards)=>{
          return cards.map(mapCard)
        })
      }
      </div>
    );
  }
}
