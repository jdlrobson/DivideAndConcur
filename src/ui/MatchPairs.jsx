/** @jsx h */
import { Component, h } from 'preact';
import Card from './Card';

import './matchpairs.less';

class MatchPairs extends Component {
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
                        hideCharacter={!card.isAnswered && pairIndex !== index}
                        hideEnglish={!card.iAnswered && pairIndex === index}
                        hidePinyin={!card.isAnswered}
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
                        hideEnglish={!card.isAnswered}
                        hidePinyin={!card.iAnswered && pairIndex === index}
                        hideCharacter={!card.isAnswered && pairIndex !== index}
                        isSelected={isSelected}
                        selectedControls={false} isFrozen={isFrozen} />
                );
            });
        } else if (mode === 4) {
            cards = props.children;
        }

        let classModifiers = props.countdown > 0 ? 'game-match-pairs__cards--countdown' : '';
        let modifier = '';
        if (props.countdown === 1) {
            modifier = ' game-match-pairs__countdown--hiding';
        } else if (props.countdown === 0) {
            modifier = ' game-match-pairs__countdown--hidden';
        }

        if (cards.length === 1) {
            classModifiers += ' game-match-pairs__cards--single';
        } else if (cards.length !== 3 && cards.length < 5) {
            classModifiers += ' game-match-pairs__cards--grid-small';
        }

        return (
            <div className='game-match-pairs'>
                <div className={`game-match-pairs__countdown${modifier}`}>{props.countdown}</div>
                <div className={`game-match-pairs__cards ${classModifiers}`}>{
                    cards
                }{
                    props.showHint && <p className='game-match-pairs__hint'>Click a box to start</p>
                }</div>
                <div className='game-match-pairs__end-marker' />
            </div>
        );
    }
}

MatchPairs.defaultProps = {
    cards: []
};

export default MatchPairs;
