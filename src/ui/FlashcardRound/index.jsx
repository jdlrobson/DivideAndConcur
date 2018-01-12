/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card'

class FlashcardRound extends Component {
  render(props) {
    return (
      <div className="round">{
        props.cards.map((cardProps) => {
          return <Card {...props}
            isSelected={props.round > 0}
            isFrozen={props.round > 0}
            {...cardProps}
            key={'card-' + cardProps.character + '-' + props.round} />;
        })
      }</div>
    );
  }
}

FlashcardRound.defaultProps = { round: 0, cards: [] };
export default FlashcardRound;
