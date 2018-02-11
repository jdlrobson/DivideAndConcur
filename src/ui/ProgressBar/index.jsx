/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

export default class ProgressBar extends Component {
    render(props) {
        const style = {
            width: `${props.percent}%`
        };
        const styleRed = {
            width: `${props.percentRed}%`
        };

        return (
            <div className='progress-bar'>
                <div className='progress-bar__bar'>
                    <div style={style} />
                    <div style={styleRed} />
                </div>
                <label className='progress-bar__label'>{props.children}</label>
            </div>
        );
    }
}
