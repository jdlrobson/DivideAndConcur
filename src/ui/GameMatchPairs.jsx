/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card';
import GameDescription from './GameDescription';
import { flipCardsAfter, answerFlashcard } from './../actions';

class GameMatchPairs extends Component {
    componentDidMount() {
        if (!this.props.isFlipped) {
            this.props.onStart();
        }
    }
    componentDidUpdate() {
        if (!this.props.isFlipped) {
            this.props.onStart();
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
            if (selectedCards[0].character === selectedCards[1].character) {
                this.props.onCorrect(selectedCards[0].character);
            } else if (this.props.isFlipped) {
                this.props.onIncorrect();
            }
        }
    }
    render(props) {
        const isFrozen = !this.canSelect();
        const cards = props.cards;
        const msg = props.isFlipped ?
            'Match the pairs to win the cards!' :
            'The cards will be flipped soon! Try and remember their locations!';
        const className = props.isFlipped ? 'game-match-pairs__card' :
            'game-match-pairs__card--pending';

        return (
            <div className='game-match-pairs'>
                <GameDescription>{msg}</GameDescription>
                {
                    cards.map((card) => {
                        return (
                            <Card className={className}
                                selectedControls={false} isSelected {...card} isFrozen={isFrozen} />
                        );
                    })
                }
                <div className='game-match-pairs__end-marker' />
            </div>
        );
    }
}

GameMatchPairs.defaultProps = {
    cards: []
};

const mapStateToProps = (state, props) => {
    const { cards, isFlipped } = state;

    return Object.assign({}, props, { cards, isFlipped });
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onIncorrect: () => {
            dispatch(flipCardsAfter(1000));
        },
        onCorrect: (char) => {
            dispatch(answerFlashcard(true, char, false));
        },
        onStart: () => {
            dispatch(flipCardsAfter(5000));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameMatchPairs);
