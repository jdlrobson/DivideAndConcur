/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card';
import { MATCH_DEFINITION } from './../../constants';
import { connect } from 'preact-redux';
import { endRound } from './../../actions';
import './styles.less';

/**
 * Obscures card's pinyin to look more like target card
 * @param {Card} targetCard
 * @param {Card} card
 */
export function obscurePinyinInCard(targetCard, card) {
    const targetChar = Array.from(targetCard.character)[0];
    const targetPinyin = targetCard.pinyin.split(' ');
    let displayCharacter;
    let label = card.pinyin;
    let english;
    const character = card.character;

    const labelSplit = label.split(' ');
    // make sure pinyin is same length as target
    if (targetPinyin.length > labelSplit.length) {
        // If the target is 2 characters and this is one, we'll want to update this one
        // to be a worthy answer (otherwise its obvious which is the correct answer)
        if (targetPinyin[0] === targetPinyin[1]) {
            // in this case we have something like 暗暗 so let's double this label
            // e.g. 水 becomes 水水
            label = `${label} ${label}`;
            displayCharacter = character + character;
        } else {
            // in this case we have something like 火山 where the characters are different
            // e.g. 水 becomes 水山
            label = `${targetPinyin[0]} ${label}`;
            displayCharacter = targetChar + character;
        }
        // Since this is no longer a real word, reset english
        english = '';
    } else if (targetPinyin.length < labelSplit.length) {
        // Here we have the case where the answer is 水 but we have a card 火山
        // 火山 becomes 火
        label = labelSplit[0];
        displayCharacter = Array.from(character)[0];
        // Since this /might/ no longer a real word, reset english
        english = '';
    } else if (targetPinyin.length === labelSplit.length) {
        const targetDupeCharacters = targetPinyin[0] === targetPinyin[1];
        const answerDupeCharacters = labelSplit[0] === labelSplit[1];

        // If the solution is 暗暗 and one of possible answers is 暗暗
        // characters of the answer are different
        if (!answerDupeCharacters && targetDupeCharacters) {
            label = labelSplit[0] + ' ' + labelSplit[0];
            displayCharacter = Array.from(character)[0];
            displayCharacter += character;
            // Since this /might/ no longer a real word, reset englis
            english = '';
        } else if ( answerDupeCharacters && !targetDupeCharacters ) {
            // If correct answer is 火山 and one of answers is 暗暗 turn 暗暗 into a viable answer
            label = labelSplit[0] + ' ' + targetPinyin[0];
            displayCharacter = Array.from(character)[0] + targetChar;
            // Since this /might/ no longer a real word, reset english
            english = '';
        }
    }
    return { displayCharacter, english, pinyin: label };
}

export const getCardProps = (cardProps, mode, targetCard, isFinished) => {
    let modeBasedCardData;
    if (mode === 0) {
        const newProps = obscurePinyinInCard(targetCard, cardProps);
        modeBasedCardData = Object.assign({ hideEnglish: true },
            cardProps, newProps);
    } else {
        modeBasedCardData = {
            hidePinyin: true,
            character: cardProps.character,
            english: cardProps.english
        };
    }

    return Object.assign({}, cardProps, {
        hideCharacter: !cardProps.isAnswered,
        className: 'game-one-four__choices__card',
        selectedControls: false,
        hideDifficulty: true,
        debug: false
    }, modeBasedCardData);
};

class GameOneInFour extends Component {
    componentWillUpdate(props) {
    // if all cards frozen and answered.. then trigger end round
        if (props.onFinished && this.isFinished(props)) {
            props.onFinished();
        }
    }
    isFinished(props) {
        return props.cards.slice(1).filter(card => card.isAnswered).length === 1;
    }
    render(props) {
        const card = props.cards[0];
        const isFinished = this.isFinished(props);

        return (<div className='game-one-four'>
            <div className='game-one-four__cards'>
                <Card {...card} isLarge isSelected={isFinished}
                    isFrozen hidePinyin={!isFinished} hideEnglish={!isFinished}
                /><div className='game-one-four__choices'>{
                    props.cards.slice(1)
                        .map(cardProps =>
                            <Card {...getCardProps(cardProps, props.mode, card, isFinished)}
                                onExpandCard={false} />
                        )
                }
                </div>
            </div>
        </div>);
    }
}

const mapDispatchToProps = (dispatch, props) => {
    return {
        onFinished: () => {
            dispatch(endRound());
        }
    };
};

const mapStateToProps = (state, props) => {
    const {
        card,
        goal,
        game,
        cards,
    } = state;
    const mode = game === MATCH_DEFINITION ? 1 : 0;

    return Object.assign({}, props, { cards, card, goal, mode });
};

export default connect(mapStateToProps, mapDispatchToProps)(GameOneInFour);
