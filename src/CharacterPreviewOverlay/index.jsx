/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

export default class CharacterPreview extends Component {
  componentDidMount() {
    fetch( '/summarize/' + encodeURIComponent( this.props.char ) ).then((res)=>res.json())
      .then((state) => this.setState(state));
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
    console.log(content);
    return (
      <div className="overlay" onClick={this.stopPropagation}>
        <h2>{props.char}</h2>
        <div dangerouslySetInnerHTML={{__html: content}}></div>
      </div>
    )
  }
}