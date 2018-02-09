/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Card from './Card';
import GameDescription from './GameDescription';
import { flipCardsAfter } from './../actions';

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
    render(props) {
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
                                selectedControls={false} isSelected {...card} />
                        );
                    })
                }
                <div className='game-match-pairs__end-marker' />
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    const { cards, isFlipped } = state;

    return Object.assign({}, props, { cards, isFlipped });
};

const mapDispatchToProps = (dispatch, props) => {
    return {
        onStart: () => {
            dispatch(flipCardsAfter(5000));
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameMatchPairs);
