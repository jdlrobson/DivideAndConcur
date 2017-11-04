/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'
import Memory from './Memory'
import Dictionary from './Dictionary'

const NUM_CARDS_PER_LEVEL = 10;

export default class Game extends Component {
  constructor() {
    super();
    this.state = { score: 0, cards: false, level: 1, answered: 0, round: 0 };
  }
  componentWillMount() {
    const props = this.props;
    this.memory = new Memory(props.initialMemory, props.saveMemory);
    this.dictionary = new Dictionary();
  }
  /**
   * Deal ten cards from the dictionary that the user is unfamiliar with
   * sorted by difficulty level
   */
  deal( dictionary ) {
    const memory = this.memory;
    let offset = 0;
    let level = 1;
    let curDict = dictionary.deal(offset, NUM_CARDS_PER_LEVEL);
    let previous = [];

    while ( Object.keys( curDict ).length && memory.knowsWords( Object.keys( curDict ) ) ) {
      offset += NUM_CARDS_PER_LEVEL;
      previous.push( Object.keys( curDict ) );
      curDict = dictionary.deal(offset, NUM_CARDS_PER_LEVEL);
      level += 1;
    }

    // We now have a dictionary of 10 words that the user doesn't know.

    const cards = Object.keys( curDict ).sort((char, char2) => {
      // sort by difficulty
      return memory.getDifficulty(char) < memory.getDifficulty(char2) ? 1 : -1;
    });

    // present
    this.setState( { cards, level, answered: 0,
      round: this.state.round + 1,
      previous: previous.reverse()
    } );
  }
  componentDidMount() {
    const setState = this.setState.bind( this );
    const deal = this.deal.bind( this );
    const dictionary = this.dictionary;

    // Load the dictionary
    dictionary.load(0).then(()=> {
      deal( dictionary );
    });

    this.updateScore();
  }
  componentDidUpdate() {
    if ( this.state.cards ) {
      if ( this.state.answered === this.state.cards.length ) {
        this.deal( this.dictionary );
      }
    }
  }
  updateScore() {
    this.setState( { score: this.memory.getScore() } );
  }
  updateScoreFromWrongAnswer( char ) {
    this.memory.markAsDifficult( char );
    this.updateScore();
    this.setState( { answered: this.state.answered + 1 });
  }
  updateScoreFromCorrectAnswer( char ) {
    const score = this.state.score + 1;
    this.memory.markAsEasy( char );
    this.updateScore();
    this.setState( { answered: this.state.answered + 1 });
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
        key={'card-' + char + '-' + state.round}
        difficultyLevel={rating}
        character={char}
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
      <div className="game">
      <h2>Level {state.level}</h2>
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
