/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import './styles.less';
import { revealFlashcard, answerFlashcard } from './../../actions'

function className( block, element, modifiers=[] ) {
    let blockElement = block;
    if ( element ) {
        blockElement += '__' + element;
    }
    return blockElement + ' ' + modifiers.map((modifier)=> {
        return blockElement + '--' + modifier;
    }).join( ' ' );
}

class Card extends Component {
  onClick(ev) {
    const props = this.props;
    if ( !props.isSelected && !props.isFrozen ) {
      props.onSelect( props.character, props.index );
    }
    if ( props.onClick ) {
      props.onClick(ev, this.props);
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
  render(props) {
    const blockName = 'card';
    const additionalClassName = props.className || '';
    const hidden = { display: 'none' };
    let modifiers = [];
    let dLevel = props.difficultyLevel;
    const isEasy = dLevel < 0;
    const isKnown = dLevel < -4;
    const isSelected = props.isSelected;
    const isFrozen = props.isFrozen;
    let done = props.isAnswered;
    let components = [];

    if ( isEasy ) {
      dLevel = -dLevel;
    }

    const difficultyBar = props.debug ? (
        <div className={className(blockName, 'difficulty-bar')}>
            {
              new Array(dLevel).fill((<div className={isEasy ? 'easy' : ''} />))
            }
            { props.level }
        </div>
    ) : [];

    if ( done ) {
      modifiers.push( props.isKnown ? 'known' : 'unknown' );
    }
    if ( props.isHighlighted ) {
      modifiers.push( 'highlighted' );
    }
    if ( props.isFlipped && !isSelected ) {
      modifiers.push( 'flipped' );
    }
    const translations = [
        <div key='lang' className={className(blockName, 'english')}
            style={isSelected ? {} : hidden}>{props.english}</div>,
        <div key='pinyin' className={className(blockName, 'pinyin')}
            style={isSelected ? {} : hidden}>{props.pinyin}</div>
    ];
    const buttons = props.selectedControls ? [
        <div key='tick' className='tick button' onClick={this.tick.bind(this)}
          style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>✅</div>,
        <div key='wrong' className='wrong button' onClick={this.wrong.bind(this)}
          style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>❌</div>
    ] : false;

    if ( props.isSmall ) {
        modifiers.push( 'small' );
    }
    components = translations.concat( buttons );
    if ( props.isLarge ) {
        modifiers.push( 'large' );
    }
    const label = props.label || props.character;
    const labelModifiers = [];
    if (label.length > 4) {
      labelModifiers.push('long');
    }
    //if ( !props.english && !props.character)
    return (
      <div className={className(blockName, false, modifiers) + ' ' + additionalClassName}
        onClick={this.onClick.bind(this)}>
      <div className={className(blockName, 'front')}>
          {difficultyBar}
          <div key='char' className={className(blockName, 'label', labelModifiers)}>{label}</div>
          {components}
      </div>
      <div className={className(blockName, 'back')} />
      </div>
    );
  }
}

Card.defaultProps = {
  // Show the difficulty and word size
  debug: true,
  // Whether to show the tick/wrong buttons when card has been selected
  selectedControls: true
};

const mapDispatchToProps = (dispatch, props) => {
  return {
    onSelect: ( character, index ) => {
      dispatch( revealFlashcard( character, index ) );
    },
    onAnswered: ( character, index, isCorrect ) => {
      dispatch( answerFlashcard( isCorrect, character, index ) );
    }
  };
};

export default connect( null, mapDispatchToProps )(Card);

