/** @jsx h */
import { Component, h } from 'preact';
import './styles.less'

export default class ProgressBar extends Component {
  render(props) {
    const style = {
      width: `${props.percent}%`
    };

    return (
      <div className="progress-bar">
        <div><div style={style} /></div>
        <label>{props.children}</label>
      </div>
    );
  }
}
