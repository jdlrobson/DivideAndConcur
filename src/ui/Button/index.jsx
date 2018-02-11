/** @jsx h */
import { Component, h } from 'preact';
import './styles.less'

class Button extends Component {
    render({ children, onClick }) {
        return (
            <button className="button" onClick={onClick}>{children}</button>
        );
    }
}

export default Button;
