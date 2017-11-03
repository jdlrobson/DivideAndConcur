/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'
import Memory from './Memory'

function getWords(size) {
  return fetch('/data/' + size).then((r) => {
    return r.json();
  });
}

export default class Game extends Component {
  constructor() {
    super();
    this.state = { score: 0 };
  }
  componentWillMount() {
    const props = this.props;
    this.memory = new Memory(props.initialMemory, props.saveMemory);
  }
  deal() {
    const dictionary = this.state.dictionary;
    const memory = this.memory;
    const cards = dictionary ? Object.keys( dictionary ).
      sort((char, char2) => {
        // sort by difficulty
        return memory.getDifficulty(char) < memory.getDifficulty(char2) ? 1 : -1;
      }) : false;
    this.setState( { cards } );
  }
  componentDidMount() {
    const setState = this.setState.bind( this );
    const deal = this.deal.bind( this );
    getWords(0).then((dictionary) => {
      setState( { dictionary } );
      deal();
    });
    this.updateScore();
  }
  updateScore() {
    this.setState( { score: this.memory.getScore() } );
  }
  updateScoreFromWrongAnswer( char ) {
    this.memory.markAsDifficult( char );
    this.updateScore();
  }
  updateScoreFromCorrectAnswer( char ) {
    const score = this.state.score + 1;
    this.memory.markAsEasy( char );
    this.updateScore();
  }
  render() {
    const props = this.props;
    const state = this.state;
    const memory = this.memory;
    const dictionary = this.state.dictionary;
    const cards = state.cards ? state.cards.map((char) => {
      return <Card
        className='card'
        key={'card-' + char}
        difficultyLevel={memory.getDifficulty(char)}
        onIncorrect={this.updateScoreFromWrongAnswer.bind(this)}
        onCorrect={this.updateScoreFromCorrectAnswer.bind(this)}
        character={char}
        english={dictionary[char]}
      />;
    }) : false;
    const loader = <div>Loading up!</div>;

    return (
      <div className="game">
      <h2>Level {props.level}</h2>
      <div>Score: {state.score}</div>
      {cards || loader }
      </div>
    );
  }
}
