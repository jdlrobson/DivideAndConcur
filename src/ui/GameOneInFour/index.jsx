/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card';
import { MATCH_DEFINITION } from './../../constants';
import { connect } from 'preact-redux';
import { endRound } from './../../actions';
import './styles.less';

export const getCardProps = (cardProps, mode, targetCard, isFinished) => {
    let character = cardProps.character;
    let label = mode === 0 ? cardProps.pinyin : cardProps.english;
    if (mode === 0) {
        const targetChar = Array.from(targetCard.character)[0];
        const targetPinyin = targetCard.pinyin.split(' ');
        // make sure pinyin is same length as target
        if (targetPinyin.length > label.split(' ').length) {
            label = `${targetPinyin[0]} ${label}`;
            character = targetChar + character;
        } else if (targetPinyin.length < label.split(' ').length) {
            label = label.split(' ')[0];
            character = Array.from(character)[0];
        }
    }
    const modeBasedCardData = mode === 0 ?
        { hideEnglish: true, pinyin: label, character } :
        { hidePinyin: true,
            character,
            english: label };
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
