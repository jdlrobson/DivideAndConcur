/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import Button from './../Button';
import { dismountDeck } from './../../actions';

/**
 * Shows once when a card deck has been exhausted
 */
class ExhaustedDeck extends Component {
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
