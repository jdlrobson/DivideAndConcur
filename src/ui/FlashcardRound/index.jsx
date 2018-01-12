/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card'

class FlashcardRound extends Component {
  render() {
    const props = this.props;

    return (
      <div className="round">{
        props.cards.map((cardProps) => {
          return <Card {...props}{...cardProps}
            key={'card-' + cardProps.character + '-' + props.round} />;
        })
      }</div>
    );
  }
}

FlashcardRound.defaultProps = { round: 0 };
export default FlashcardRound;
