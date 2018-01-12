/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

export default class CharacterPreview extends Component {
  stopPropagation(ev) {
    ev.stopPropagation();
  }
  render() {
    const props = this.props;
    let content = props.pinyin;
    if ( content === undefined ) {
      content = 'Loading...';
    } else if ( !content ) {
      content = 'No information available';
    }
    return (
      <div className="overlay" onClick={this.stopPropagation}>
        <h2>{props.char}</h2>
        <div dangerouslySetInnerHTML={{__html: content}}></div>
      </div>
    )
  }
}
