/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

class Card extends Component {
  onClick() {
    const props = this.props;
    this.setState({revealed: true});
    props.store.dispatch( props.actionTypes.REVEAL_FLASHCARD );
  };
  wrong() {
    this.setState({done: true});
    if ( this.props.onIncorrect ) {
      this.props.onIncorrect( this.props.character );
    }
  };
  tick() {
    this.setState({done: true, knew: true});
    if ( this.props.onCorrect ) {
      this.props.onCorrect( this.props.character );
    }
  };
  onClickGlyph(ev) {
    const props = this.props;
    if ( this.state.revealed && props ) {
      props.store.dispatch( {
        type: props.actionTypes.REVEAL_FLASHCARD_PRONOUNCIATION.type,
        char: props.character
      } );
      ev.stopPropagation();
    }
  };
  render() {
    const hidden = { display: 'none' };
    const state = this.state;
    let className = 'card';
    const props = this.props;
    let dLevel = props.difficultyLevel;
    const isEasy = dLevel < 0 ? true : false;
    const isKnown = dLevel < -4 && !this.props.onCorrect;

    if ( isEasy ) {
      dLevel = -dLevel;
    }

    if ( state.done ) {
      className += state.knew ? ' card-known' : ' card-unknown';
    }
    if ( props.isHighlighted ) {
      className += ' card-highlighted';
    }
    return (
      <div className={className} onClick={this.onClick.bind(this)}>
          <div className={"difficulty-bar"}>
          {
            new Array(dLevel).fill((<div className={isEasy ? 'easy' : ''} />))
          }
          </div>
          <div key='char' className="char">
            <a onClick={this.onClickGlyph.bind(this)}>{props.character}</a>
          </div>
          <div key='lang' className='english' style={state.revealed ? {} : hidden}>{props.english}</div>
          <div key='tick' className='tick button' onClick={this.tick.bind(this)}
            style={state.revealed && !state.done && !isKnown ? {} : hidden}>✅</div>
          <div key='wrong' className='wrong button' onClick={this.wrong.bind(this)}
            style={state.revealed && !state.done && !isKnown ? {} : hidden}>❌</div>
      </div>
    );
  }
}

export default Card;
