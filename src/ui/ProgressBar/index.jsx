/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

export default class ProgressBar extends Component {
    render(props) {
        const percent = (props.known / props.total) * 100;
        const percentRed = (props.unknown / props.total) * 100;
        const msg = `${props.known} of ${props.total}`;
        const style = {
            width: `${percent}%`
        };
        const styleRed = {
            width: `${percentRed}%`
        };

        return (
            <div className='progress-bar'>
                <div className='progress-bar__bar'>
                    <div style={style} />
                    <div style={styleRed} />
                </div>
                <label className='progress-bar__label'>{msg}</label>
            </div>
        );
    }
}
