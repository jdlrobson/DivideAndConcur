/** @jsx h */
import { Component, h } from 'preact';
import './styles.less'

class Button extends Component {
    render({ children, onClick, disabled }) {
        return (
            <button className="button"
                disabled={disabled}
                onClick={onClick}>{children}</button>
        );
    }
}

export default Button;
