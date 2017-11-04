/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

class Card extends Component {
  onClick() {
    this.setState({revealed: true});
  };
  wrong() {
    this.setState({done: true});
    if ( this.props.onIncorrect ) {
      this.props.onIncorrect( this.props.character );
    }
  };
  tick() {
    this.setState({done: true, knew: true});
    if ( this.props.onCorrect ) {
      this.props.onCorrect( this.props.character );
    }
  };
  render() {
    const hidden = { display: 'none' };
    const state = this.state;
    let className = 'card';
    const props = this.props;
    let dLevel = props.difficultyLevel;
    const isEasy = dLevel < 0 ? true : false;
    const isKnown = dLevel < -4 && !this.props.onCorrect;

    if ( isEasy ) {
      dLevel = -dLevel;
    }

    if ( state.done ) {
      className += state.knew ? ' card-known' : ' card-unknown';
    }
    return (
      <div className={className} onClick={this.onClick.bind(this)}>
          <div className={"difficulty-bar"}>
          {
            new Array(dLevel).fill((<div className={isEasy ? 'easy' : ''} />))
          }
          </div>
          <div key='char' className="char">{props.character}</div>
          <div key='lang' className='english' style={state.revealed ? {} : hidden}>{props.english}</div>
          <div key='tick' className='tick button' onClick={this.tick.bind(this)}
            style={state.revealed && !state.done && !isKnown ? {} : hidden}>✅</div>
          <div key='wrong' className='wrong button' onClick={this.wrong.bind(this)}
            style={state.revealed && !state.done && !isKnown ? {} : hidden}>❌</div>
      </div>
    );
  }
}

export default Card;
