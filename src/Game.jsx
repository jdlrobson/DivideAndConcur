/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'
import Memory from './Memory'
import Dictionary from './Dictionary'
import './game.less'

const NUM_CARDS_PER_LEVEL = 10;

export default class Game extends Component {
  constructor() {
    super();
    this.state = { score: 0, cards: false, level: 1,
      difficulty: 0, wordSize: 0,
      answered: 0, round: 0 };
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
    this.updateDeck(0,0)
  }
  loadDeck(wordSize, wordDifficulty) {
    const deal = this.deal.bind( this );
    const dictionary = this.dictionary;
    const loadDeck = this.loadDeck.bind( this );

    // Load the dictionary
    return dictionary.expand(wordSize, wordDifficulty).then(()=> {
      if ( dictionary.size() > 0 ) {
        deal( dictionary );
      } else {
        if ( wordDifficulty === 0 ) {
          throw 'reached end of game';
        } else {
          return loadDeck( wordSize + 1, 0 );
        }
      }
    });
  }
  updateDeck(wordSize, wordDifficulty) {
    const setState = this.setState.bind( this );
    const updateScore = this.updateScore.bind( this );
    this.loadDeck(wordSize, wordDifficulty).
      then(() => {
        updateScore();
        setState( { wordSize: wordSize, difficulty: wordDifficulty });
      });
  }
  componentDidUpdate() {
    const state = this.state;
    const cards = state.cards;

    if ( cards ) {
      if ( !cards.length ) {
        this.loadDeck( state.wordSize, state.difficulty + 1 );
      } else if ( cards.length && this.state.answered === cards.length ) {
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
