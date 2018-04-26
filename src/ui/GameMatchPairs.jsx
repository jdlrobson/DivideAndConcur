/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card';
import GameDescription from './GameDescription';
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
        const flipMsgs = props.flipMessages || [
            'Flipping soon!',
            'Match the pairs!'
        ];
        let msg;
        if (this.state.numFlips > 1) {
            msg = props.isFlipped ? flipMsgs[1] : '不幸!';
        } else {
            msg = props.isFlipped ? flipMsgs[1] : flipMsgs[0];
        }
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
                        english={false}
                        label={pairIndex === index ? undefined : card.english}
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
                        pinyin={false}
                        label={pairIndex === index ? undefined : card.pinyin}
                        selectedControls={false} isFrozen={isFrozen} />
                );
            });
        }

        return (
            <div className='game-match-pairs'>
                <GameDescription>{msg}</GameDescription>
                <div>{
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
    const { cards, isFlipped, deck } = state;
    let flipMessages;
    let delayStart = 5000;
    switch (deck) {
        case DECK_NEW:
            delayStart = 10000;
            flipMessages = [
                'Here\'s some new cards to get acquainted with.',
                'Match the pairs until you become familiar with them!'
            ];
            break;
        default:
            break;
    }

    return Object.assign({}, props, { cards, isFlipped, flipMessages, delayStart });
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
