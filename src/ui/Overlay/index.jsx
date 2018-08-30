/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

export default class Overlay extends Component {
    render(props) {
        return (
            <div className='app__overlay' {...props}>{props.children}</div>
        );
    }
}
