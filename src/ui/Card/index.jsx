/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import './styles.less';
import actionTypes from './../../actionTypes'

class Card extends Component {
  onClick(ev) {
    const props = this.props;
    if ( !props.isSelected ) {
      props.onSelect( props.character, props.index );
    }
  };
  wrong(ev) {
    const props = this.props;
    props.onAnswered( props.character, props.index, false );
    ev.stopPropagation();
  };
  tick(ev) {
    const props = this.props;
    props.onAnswered( props.character, props.index, true );
    ev.stopPropagation();
  };
  requestPidgin(ev) {
    const props = this.props;

    props.onClickListen( props.character );
    ev.stopPropagation();
  };
  render(props) {
    const hidden = { display: 'none' };
    let className = 'card';
    let dLevel = props.difficultyLevel;
    const isEasy = dLevel < 0;
    const isKnown = dLevel < -4;
    const isSelected = props.isSelected;
    const isFrozen = props.isFrozen;
    let done = props.isAnswered;

    if ( isEasy ) {
      dLevel = -dLevel;
    }

    if ( done ) {
      className += props.isKnown ? ' card-known' : ' card-unknown';
    }
    if ( props.isHighlighted ) {
      className += ' card-highlighted';
    }
    if ( props.isFlipped && !isSelected ) {
      className += ' card-flipped';
    }

    return (
      <div className={className} onClick={this.onClick.bind(this)}>
      <div className="front">
          <div className={"difficulty-bar"}>
          {
            new Array(dLevel).fill((<div className={isEasy ? 'easy' : ''} />))
          }
          { props.level }
          </div>
          <div key='char' className="char">
          {props.character}
          </div>
          <div key='lang' className='english' style={isSelected ? {} : hidden}>{props.english}</div>
          <div key='pinyin' className='pinyin' style={isSelected ? {} : hidden}>{props.pinyin}</div>
          <div key='tick' className='tick button' onClick={this.tick.bind(this)}
            style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>✅</div>
          <div key='wrong' className='wrong button' onClick={this.wrong.bind(this)}
            style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>❌</div>
          <div key="pinyin" className="pinyin button" onClick={this.requestPidgin.bind(this)}>🔊</div>
      </div>
      <div className="back" />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    onSelect: ( character, index ) => {
      dispatch( Object.assign( {}, actionTypes.REVEAL_FLASHCARD,
        { character, index } )
      );
    },
    onClickListen: ( character ) => {
      dispatch( {
        type: actionTypes.REQUEST_PINYIN_START.type,
        character
      } );
    },
    onAnswered: ( character, index, isCorrect ) => {
      const action = isCorrect ? actionTypes.GUESS_FLASHCARD_RIGHT
        : actionTypes.GUESS_FLASHCARD_WRONG;

      dispatch( {
        type: action.type,
        character,
        index
      } );
    }
  };
};

export default connect( null, mapDispatchToProps )(Card);

