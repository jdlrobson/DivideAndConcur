/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import { setDeck } from './../../actions'
import { DECK_NEW, DECK_KNOWN, DECK_UNKNOWN } from './../../constants'
import Button from './../Button'
import ButtonGroup from './../ButtonGroup'

import './styles.less'

class DeckSelection extends Component {
  setDeck( deck ) {
    this.props.setDeck( deck );
  }
  render(props) {
    let revise = [];

    return (
        <ButtonGroup>
          <p>How would you like to play today?</p>
          <Button onClick={(ev)=>this.setDeck( DECK_NEW )}>New words</Button>
          <Button onClick={(ev)=>this.setDeck( DECK_UNKNOWN )}
              disabled={props.knownWordCount === 0}>Difficult words</Button>
          <Button onClick={(ev)=>this.setDeck( DECK_KNOWN )}
              disabled={props.knownWordCount === 0}>Familiar words</Button>
        </ButtonGroup>
      );
  }
}

const mapDispatchToProps = (dispatch, props) => {
  return {
    setDeck: ( deck ) => {
      dispatch(setDeck(deck));
    }
  };
};

export default connect( undefined, mapDispatchToProps )(DeckSelection);
