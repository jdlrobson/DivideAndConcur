/** @jsx h */
import { Component, h } from 'preact';

export default class Tab extends Component {
    render(props) {
        return (
            <div className='tab'>
                {props.children}
            </div>
        );
    }
}
