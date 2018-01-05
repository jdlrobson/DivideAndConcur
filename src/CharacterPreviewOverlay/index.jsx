/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

import mcs from './../../mcs'

export default class CharacterPreview extends Component {
  componentDidMount() {
    mcs.getPronounciation( this.props.char )
      .then(( text ) => this.setState( { text } ));
  }
  stopPropagation(ev) {
    ev.stopPropagation();
  }
  render() {
    const props = this.props;
    let content = this.state.text;
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
