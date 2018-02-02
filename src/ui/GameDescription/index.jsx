/** @jsx h */
import { Component, h } from 'preact';
import './styles.less'

export default class GameDescription extends Component {
  render(props) {
    return (
      <p className="game-description">{props.children}</p>
    );
  }
}
