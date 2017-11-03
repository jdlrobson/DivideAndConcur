/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card'

export default class Game extends Component {
  render() {
    const props = this.props;
    const dictionary = props.dictionary;
    const cards = Object.keys( dictionary ).map((char) => {
      return <Card
        className='card'
        key={'card-' + char}
        character={char}
        english={dictionary[char]}
      />;
    });
    return (
      <div className="game">
      <h2>Level {props.level}</h2>
      {cards}
      </div>
    );
  }
}
