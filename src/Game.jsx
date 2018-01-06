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
    this.state = { score: 0, cards: false, level: 1,
      highlighted: [],
      difficulty: 0, wordSize: 0,
      answered: 0, round: 0 };
  }
  componentWillMount() {
    const props = this.props;
    this.memory = new Memory(props.initialMemory, props.saveMemory);
    this.dictionary = new Dictionary();
    this.dealer = new Dealer( this.dictionary, this.memory );
  }
  /**
   * Deal ten cards from the dictionary that the user is unfamiliar with
   * sorted by difficulty level
   */
  deal() {
    const cards = this.dealer.deal();
    const level = this.dealer.getLevel();
    const previous = this.dealer.getHistory();
    const wordSize = this.dealer.currentWordSize;
    const difficulty = this.dealer.currentDifficultyLevel;

    // present
    this.setState( { cards, level, answered: 0,
      round: this.state.round + 1,
      wordSize,
      difficulty,
      score: this.memory.getScore(),
      previous: previous
    } );
  }
  refresh() {
    this.setState( this.props.store.getState() );
  }
  componentDidMount() {
    // On any change in global state re-render.
    this.props.store.subscribe( this.refresh.bind( this ) );
    this.loadDeck(0,0)
  }
  loadDeck(wordSize, wordDifficulty) {
    const deal = this.deal.bind( this );

    // Load the dictionary
    this.dealer.load(wordSize, wordDifficulty);
    deal();
  }
  componentDidUpdate() {
    const state = this.state;
    const cards = state.cards;

    if ( cards ) {
      if ( !cards.length ) {
        this.loadDeck( state.wordSize, state.difficulty + 1 );
      } else if ( cards.length && this.state.answered === cards.length ) {
        this.deal();
      }
    }
  }
  updateScoreFromWrongAnswer( char ) {
    this.memory.markAsDifficult( char );
    this.setState( { answered: this.state.answered + 1,
      highlighted: this.dictionary.toRadicals( char ),
      score: this.memory.getScore()
    });
  }
  updateScoreFromCorrectAnswer( char ) {
    const score = this.state.score + 1;
    this.memory.markAsEasy( char );
    this.setState( { answered: this.state.answered + 1,
      highlighted: this.dictionary.toRadicals( char ),
      score: this.memory.getScore()
    });
  }
  onGameClick() {
    this.props.store.dispatch( this.props.actionTypes.CLICK_ROOT_NODE );
  }
  render() {
    const props = this.props;
    const state = this.state;
    const memory = this.memory;
    const dictionary = this.dictionary;
    const onIncorrect = this.updateScoreFromWrongAnswer.bind(this);
    const onCorrect = this.updateScoreFromCorrectAnswer.bind(this);

    function mapCard( char, events = {} ) {
      const rating = memory.getDifficulty(char);

      return <Card {...events}
        className='card'
        isHighlighted={state.highlighted.indexOf(char) > -1}
        key={'card-' + char + '-' + state.round}
        difficultyLevel={rating}
        character={char}
        store={props.store}
        actionTypes={props.actionTypes}
        english={dictionary.toEnglish(char)}
      />;
    }
    function mapCardWithEvents( char ) {
      return mapCard( char, {
        onIncorrect: onIncorrect,
        onCorrect: onCorrect
      } );
    }
    const cards = state.cards ? state.cards.map(mapCardWithEvents) : false;
    const loader = <div>Loading up!</div>;
    const prev = state.previous || [];

    return (
      <div className="game" onClick={this.onGameClick.bind(this)}>
      {state.overlay}
      <h2>Level {state.level} [{state.wordSize},{state.difficulty}]</h2>
      <div>Score: {state.score}</div>
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
