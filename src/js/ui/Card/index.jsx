/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import './styles.less';
import { revealFlashcard, answerFlashcard, showCharacterOverlay } from './../../actions';
import { getDifficultyRating } from './../../helpers/difficulty-ratings';
import { className } from './../className';

import ExpandButton from './../ExpandButton';
const BLOCK_NAME = 'card';

/**
 * @typedef {object} Card
 * @property {string} pinyin
 * @property {string} character
 * @property {array} [decompositions]
 */
export class Card extends Component {
    render(props) {
        const additionalClassName = props.className || '';
        const modifiers = [];
        const isTiny = props.isTiny;
        const displayChar = props.displayCharacter || props.character;

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
            if (props.isWide === undefined &&
                displayChar && !props.label && Array.from(displayChar).length > 1
            ) {
                modifiers.push('wide');
            }
        }
        if (isTiny) {
            modifiers.push('tiny');
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
                { !isTiny && <div className={className(BLOCK_NAME, 'back')} /> }
            </div>
        );
    }
}

export class FlashCard extends Component {
    onClick(ev) {
        const props = this.props;
        if (!props.isSelected && !props.isFrozen) {
            props.onSelect(props.character, props.index);
        }
        if (props.onClick) {
            props.onClick(ev, this.props);
        }
    }
    onExpand(ev) {
        const props = this.props;
        if (props.onExpandCard) {
            props.onExpandCard(ev, props.character);
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
        const isTiny = props.isTiny;
        const done = props.isAnswered;
        let components = [];

        if (isEasy) {
            dLevel = -dLevel;
        }


        const displayChar = props.displayCharacter || props.character;
        const label = props.label !== undefined ? props.label : displayChar;
        const difficultyBar =  (
            <div className={className(BLOCK_NAME, 'difficulty-bar')} key={`difficulty-${displayChar}`}>
                { props.hideDifficulty || dLevel === undefined ? null :
                    new Array(dLevel).fill((<div className={isEasy ? 'easy' : ''} />))
                }
            </div>
        );

        const inPinyin = <div key='pinyin' className={
            className(BLOCK_NAME, 'pinyin',
                !done && props.hidePinyin ? [ 'hide' ] : []
            )
        }
        style={props.pinyin !== false ?
            {} : hidden}>{props.pinyin}</div>;

        const englishModifiers = !done && props.hideEnglish ? [ 'hide' ] : [];
        const dataAttrs = {};
        if (props.translations && props.translations.length > 1) {
            dataAttrs['data-translation-number'] = props.translations.indexOf(props.english) + 1;
            dataAttrs['data-translation-total'] = props.translations.length;
        }
        const inEnglish = <div key='lang'
            className={
                className(BLOCK_NAME, 'english',
                    englishModifiers
                )
            }
            {...dataAttrs}
            style={props.english !== false ?
                {} : hidden}>{props.english}</div>;
        const translations = [
            inPinyin,
            inEnglish
        ];
        const buttons = props.selectedControls ? [
            <div key='tick' className='tick card__control__button' onClick={this.tick.bind(this)}
                style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>✅</div>,
            <div key='wrong' className='wrong card__control__button' onClick={this.wrong.bind(this)}
                style={isSelected && !done && !isKnown && !isFrozen ? {} : hidden}>❌</div>
        ] : false;

        components = translations.concat(buttons);

        const labelModifiers = [];
        if (props.label) {
            labelModifiers.push('custom');
        }
        if (props.hideCharacter) {
            labelModifiers.push('hidden-character');
        }
        if (label && label.length > 4) {
            labelModifiers.push('long');
        }
        return (
            <Card {...props} onClick={this.onClick.bind(this)} >
                {!isTiny && props.debug && difficultyBar}
                {
                    !isTiny && props.isAnswered && props.onExpandCard !== false && (
                        <ExpandButton
                            className='card__expand-button'
                            onClick={this.onExpand.bind(this)} />
                    )
                }
                <div key='char'
                    className={className(BLOCK_NAME, 'label', labelModifiers)}
                >{label}</div>
                {!isTiny && components}
                <span className='card__debug'>
                    { props.debug ? props.level : null }
                </span>
            </Card>
        );
    }
}

FlashCard.defaultProps = {
    // Show the difficulty and word size
    debug: false,
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
    const onExpandCard = (ev, character) => {
        dispatch(showCharacterOverlay(character));
    };

    return {
        onExpandCard: props.onExpandCard !== undefined ? props.onExpandCard : onExpandCard,
        onSelect: (character, index) => {
            dispatch(revealFlashcard(character, index));
        },
        onAnswered: (character, index, isCorrect) => {
            dispatch(answerFlashcard(isCorrect, character, index));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FlashCard);
