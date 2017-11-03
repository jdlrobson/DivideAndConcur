/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

class Card extends Component {
  onClick() {
    this.setState({revealed: true});
  };
  wrong() {
    this.setState({done: true});
  };
  tick() {
    this.setState({done: true, knew: true});
  };
  render() {
    var hidden = { display: 'none' };
    var state = this.state;
    var className = 'card';
    var props = this.props;
    if ( state.done ) {
      className += state.knew ? ' card-known' : ' card-unknown';
    }
    return (
      <div className={className} onClick={this.onClick.bind(this)}>
          <div key='char' className="char">{props.character}</div>
          <div key='lang' className='english' style={state.revealed ? {} : hidden}>{props.english}</div>
          <div key='tick' className='tick button' onClick={this.tick.bind(this)}
            style={state.revealed && !state.done ? {} : hidden}>✅</div>
          <div key='wrong' className='wrong button' onClick={this.wrong.bind(this)}
            style={state.revealed && !state.done ? {} : hidden}>❌</div>
      </div>
    );
  }
}

export default Card;
