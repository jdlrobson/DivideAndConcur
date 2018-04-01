/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Button from './../Button';
import { dismountDeck } from './../../actions';
import { ALLOW_DECK_SELECTION } from './../../constants';

/**
 * Shows once when a card deck has been exhausted
 */
class ExhaustedDeck extends Component {
    componentDidMount() {
        if (!ALLOW_DECK_SELECTION) {
            this.props.onOkay();
        }
    }
    render(props) {
        return (
            <div>
                <h2>You rock!</h2>
                <p>You exhausted the current deck and ran out of cards!</p>
                <Button onClick={props.onOkay}>Choose another deck</Button>
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch, props) => {
    return {
        onOkay:() => {
            dispatch(dismountDeck());
        }
    };
};

export default connect(null, mapDispatchToProps)(ExhaustedDeck);
