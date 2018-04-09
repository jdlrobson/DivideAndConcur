/** @jsx h */
import { Component, h } from 'preact';
import Card from './../Card';
import { MATCH_DEFINITION } from './../../constants';
import { connect } from 'preact-redux';
import { endRound } from './../../actions';
import './styles.less';

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
        const mode = props.mode;

        return (
            <div className='game-decompose'>
                <p>Match the card with its sound!</p>
                <Card {...card} isLarge isSelected={this.isFinished(props)}
                    pinyin={this.isFinished(props) ? false : card.pinyin} isFrozen debug={false} />
                <div className='game-decompose__choices'>{
                    props.cards.slice(1).map((cardProps) => {
                        const modeBasedCardData = mode === 0 ?
                            { english: false, label: cardProps.pinyin } :
                            { pinyin: false, label: cardProps.english };
                        return <Card {...cardProps} isSmall
                            selectedControls={false}
                            {...modeBasedCardData} debug={false} />;
                    })
                }
                </div>
                <div className='game-decompose__end-marker' />
            </div>
        );
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
