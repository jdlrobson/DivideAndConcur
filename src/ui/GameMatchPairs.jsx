/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card';
import { DECK_NEW } from './../constants';
import { flipCardsAfter, answerFlashcard } from './../actions';
import './matchpairs.less';

class GameMatchPairs extends Component {
    constructor() {
        super();
        this.state = { numFlips: 0 };
    }
    componentDidMount() {
        if (!this.props.isFlipped) {
            this.props.onStart();
            this.setState({ numFlips: 1 });
        }
    }
    componentDidUpdate() {
        if (!this.props.isFlipped) {
            this.props.onStart(this.props.delayStart);
        }
    }
    componentWillReceiveProps(nextProps) {
        if (this.getSelectedCards(this.props).length !== this.getSelectedCards(nextProps).length) {
            this.checkForFlip(nextProps);
        }
    }
    getSelectedCards(props) {
        return props.cards.filter(card => card.isSelected && !card.isAnswered);
    }
    canSelect() {
        return this.getSelectedCards(this.props).length < 2;
    }
    checkForFlip(props) {
        const selectedCards = this.getSelectedCards(props);
        if (selectedCards.length === 2) {
            this.setState({ numFlips: this.state.numFlips + 1 });
            if (selectedCards[0].character === selectedCards[1].character) {
                this.props.onCorrect(selectedCards[0].character);
            } else if (this.props.isFlipped) {
                this.props.onIncorrect();
            }
        }
    }
    render(props) {
        const isFrozen = !this.canSelect();
        const isSelected = !isFrozen &&  !props.isFlipped;
        const className = props.isFlipped ? 'game-match-pairs__card' :
            'game-match-pairs__card--pending';
        let cards;

        const mode = props.mode || 0;
        if (mode === 0) {
            cards = props.cards.map((card) => {
                return (
                    <Card className={className} isSelected={isSelected}
                        selectedControls={false} {...card} isFrozen={isFrozen} />
                );
            });
        } else if (mode === 1) {
            // half cards show the character
            cards = props.cards.filter(card => card.english);
            cards = cards.map((card, index) => {
                const pairIndex = cards.findIndex(anotherCard =>
                    anotherCard.character === card.character);
                return (
                    <Card className={className}
                        {...card}
                        isSelected={isSelected}
                        pinyin={false}
                        hideCharacter={pairIndex !== index}
                        english={pairIndex === index ? undefined : card.english}
                        selectedControls={false} isFrozen={isFrozen} />
                );
            });
        } else if (mode === 2) {
            // half cards show the pinyin
            cards = props.cards.filter(card => card.pinyin);
            cards = cards.map((card, index) => {
                const pairIndex = cards.findIndex(anotherCard =>
                    anotherCard.character === card.character);
                return (
                    <Card className={className}
                        {...card}
                        isSelected={isSelected}
                        english={false}
                        hideCharacter={pairIndex !== index}
                        pinyin={pairIndex === index ? undefined : card.pinyin}
                        selectedControls={false} isFrozen={isFrozen} />
                );
            });
        }

        const classModifiers = props.countdown > 0 ? 'game-match-pairs__cards--countdown' : '';
        let modifier = '';
        if (props.countdown === 1) {
            modifier = ' game-match-pairs__countdown--hiding';
        } else if (props.countdown === 0) {
            modifier = ' game-match-pairs__countdown--hidden';
        }

        return (
            <div className='game-match-pairs'>
                <div className={`game-match-pairs__countdown${modifier}`}>{props.countdown}</div>
                <div className={`game-match-pairs__cards ${classModifiers}`}>{
                    cards
                }</div>
                <div className='game-match-pairs__end-marker' />
            </div>
        );
    }
}

GameMatchPairs.defaultProps = {
    cards: []
};

const mapStateToProps = (state, props) => {
    const { cards, isFlipped, deck, countdown } = state;
    let delayStart = 5000;
    switch (deck) {
        case DECK_NEW:
            delayStart = 10000;
            break;
        default:
            break;
    }

    return Object.assign({}, props, { cards, isFlipped, delayStart, countdown });
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onIncorrect: () => {
            dispatch(flipCardsAfter(1000));
        },
        onCorrect: (char) => {
            dispatch(answerFlashcard(true, char, false));
        },
        onStart: (delay) => {
            dispatch(flipCardsAfter(delay || 5000));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameMatchPairs);
