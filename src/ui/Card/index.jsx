/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import './styles.less';
import { revealFlashcard, answerFlashcard } from './../../actions';
import { getDifficultyRating } from './../../helpers/difficulty-ratings';

const BLOCK_NAME = 'card';

function className(block, element, modifiers = []) {
    let blockElement = block;
    if (element) {
        blockElement += `__${element}`;
    }
    return `${blockElement} ${modifiers.map((modifier) => {
        return `${blockElement}--${modifier}`;
    }).join(' ')}`;
}

export class Card extends Component {
    render(props) {
        const additionalClassName = props.className || '';
        const modifiers = [];
        if (props.isAnswered) {
            modifiers.push(props.isKnown ? 'known' : 'unknown');
        }

        if (props.isHighlighted) {
            modifiers.push('highlighted');
        }
        if (props.isFlipped && !props.isSelected) {
            modifiers.push('flipped');
        }
        if (props.isSmall) {
            modifiers.push('small');
            // property counts the number of UTF-16 code units in a string
            // not the number of characters
            // so use Array.from
            if (Array.from(props.character).length > 1) {
                modifiers.push('wide');
            }
        }
        if (props.isWide) {
            modifiers.push('wide');
        }
        if (props.isLarge) {
            modifiers.push('large');
        }

        if (props.children.length === 0) {
            modifiers.push('empty');
        }
        return (
            <div className={`${className(BLOCK_NAME, false, modifiers)} ${additionalClassName}`}
                onClick={props.onClick}>
                {props.children.length > 0 &&
            <div className={className(BLOCK_NAME, 'front')}>{props.children}</div>}
                <div className={className(BLOCK_NAME, 'back')} />
            </div>
        );
    }
}

class FlashCard extends Component {
    onClick(ev) {
        const props = this.props;
        if (!props.isSelected && !props.isFrozen) {
            props.onSelect(props.character, props.index);
        }
        if (props.onClick) {
            props.onClick(ev, this.props);
        }
    }
    wrong(ev) {
        const props = this.props;
        props.onAnswered(props.character, props.index, false);
        ev.stopPropagation();
    }
    tick(ev) {
        const props = this.props;
        props.onAnswered(props.character, props.index, true);
        ev.stopPropagation();
    }
    render(props) {
        const hidden = { display: 'none' };
        let dLevel = props.difficultyLevel;
        const isEasy = dLevel < 0;
        const isKnown = dLevel < -4;
        const isSelected = props.isSelected;
        const isFrozen = props.isFrozen;
        const done = props.isAnswered;
        let components = [];

        if (isEasy) {
            dLevel = -dLevel;
        }

        const difficultyBar =  (
            <div className={className(BLOCK_NAME, 'difficulty-bar')}>
                { props.hideDifficulty ? null :
                    new Array(dLevel).fill((<div className={isEasy ? 'easy' : ''} />))
                }
            </div>
        );

        const translations = [
            <div key='lang' className={className(BLOCK_NAME, 'english')}
                style={isSelected && props.english !== false ? {} : hidden}>{props.english}</div>,
            <div key='pinyin' className={className(BLOCK_NAME, 'pinyin')}
                style={isSelected && props.pinyin !== false ? {} : hidden}>{props.pinyin}</div>
        ];
        const buttons = props.selectedControls ? [
            <div key='tick' className='tick card__control__button' onClick={this.tick.bind(this)}
                style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>✅</div>,
            <div key='wrong' className='wrong card__control__button' onClick={this.wrong.bind(this)}
                style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>❌</div>
        ] : false;

        components = translations.concat(buttons);

        const label = props.label !== undefined ? props.label : props.character;
        const labelModifiers = [];
        if (props.label) {
            labelModifiers.push('custom');
        }
        if (label.length > 4) {
            labelModifiers.push('long');
        }
        // if ( !props.english && !props.character)
        return (
            <Card {...props} onClick={this.onClick.bind(this)} >
                {difficultyBar}
                <div key='char'
                    className={className(BLOCK_NAME, 'label', labelModifiers)}
                >{label}</div>
                {components}
                <span className='card__debug'>
                    { props.debug ? props.level : null }
                </span>
            </Card>
        );
    }
}

FlashCard.defaultProps = {
    // Show the difficulty and word size
    debug: true,
    // Whether to show the tick/wrong buttons when card has been selected
    selectedControls: true
};

const mapStateToProps = (state, props) => {
    const {
        answers
    } = state;
    const {
        character
    } = props;
    const difficultyLevel = getDifficultyRating(answers, character);

    return Object.assign({}, props, { difficultyLevel });
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onSelect: (character, index) => {
            dispatch(revealFlashcard(character, index));
        },
        onAnswered: (character, index, isCorrect) => {
            dispatch(answerFlashcard(isCorrect, character, index));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FlashCard);
