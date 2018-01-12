/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

export default class CharacterPreview extends Component {
  stopPropagation(ev) {
    ev.stopPropagation();
  }
  render() {
    const props = this.props;
    let content;
    if ( props.pinyin === undefined ) {
      content = 'Loading...';
    } else if ( !props.pinyin ) {
      content = 'No information available';
    } else {
      content = <div className="pinyin">{props.pinyin}</div>
    }
    return (
      <div className="overlay" onClick={this.stopPropagation}>
        <h2>{props.char}</h2>
        {content}
      </div>
    )
  }
}
