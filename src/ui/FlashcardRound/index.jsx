/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card'

import './styles.less';

class FlashcardRound extends Component {
  render(props) {
    return (
      <div className="flashcard-round">{
        props.cards.map((cardProps) => {
          return <Card
            isSelected={props.round > 0}
            isFrozen={props.round > 0}
            {...cardProps}
            key={'card-' + cardProps.character + '-' + props.round} />;
        })
      }
        <div className="flashcard-round__end-marker"></div>
      </div>
    );
  }
}

FlashcardRound.defaultProps = { round: 0, cards: [] };
export default FlashcardRound;
