/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

class Card extends Component {
  onClick(ev) {
    const props = this.props;
    if ( !props.isSelected ) {
      props.dispatch( Object.assign( {}, props.actionTypes.REVEAL_FLASHCARD,
        { character: props.character, index: props.index } ) );
    }
  };
  wrong(ev) {
    const props = this.props;
    this.setState({done: true});
    props.dispatch( {
      type: props.actionTypes.GUESS_FLASHCARD_WRONG.type,
      char: props.character
    } );
    ev.stopPropagation();
  };
  tick(ev) {
    const props = this.props;
    this.setState({done: true, knew: true});
    props.dispatch( {
      type: props.actionTypes.GUESS_FLASHCARD_RIGHT.type,
      char: props.character
    } );
    ev.stopPropagation();
  };
  requestPidgin(ev) {
    const props = this.props;

    props.dispatch( {
      type: props.actionTypes.REQUEST_PINYIN_START.type,
      char: props.character
    } );
    ev.stopPropagation();
  };
  render() {
    const hidden = { display: 'none' };
    const state = this.state;
    let className = 'card';
    const props = this.props;
    let dLevel = props.difficultyLevel;
    const isEasy = dLevel < 0 ? true : false;
    const isKnown = dLevel < -4;
    const isSelected = props.isSelected;
    const isFrozen = props.isFrozen;

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
          {props.character}
          </div>
          <div key='lang' className='english' style={isSelected ? {} : hidden}>{props.english}</div>
          <div key='tick' className='tick button' onClick={this.tick.bind(this)}
            style={isSelected && !state.done && !isKnown && !isFrozen ? {} : hidden}>✅</div>
          <div key='wrong' className='wrong button' onClick={this.wrong.bind(this)}
            style={isSelected && !state.done && !isKnown && !isFrozen ? {} : hidden}>❌</div>
          <div key="pinyin" className="pinyin button" onClick={this.requestPidgin.bind(this)}>🔊</div>
      </div>
    );
  }
}

export default Card;
