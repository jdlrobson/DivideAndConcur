/** @jsx h */
import { Component, h } from 'preact';
import './styles.less';

export default class ProgressBar extends Component {
    constructor() {
        super();
        this.state = {};
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({ animate: true });
        }, 0);
    }
    render(props) {
        const percent = Math.floor(
            (props.known / props.total) * 100
        );
        const msg = `${props.known} of ${props.total} words known (${percent}%).`;

        const blocks = [];
        let i = 100;
        const numBlocks = 16;
        const inc = 100 / numBlocks;
        const delayInc = 0.5;
        let delay = delayInc * (numBlocks - 1);
        while (i > 0) {
            const style = { transitionDelay: `${delay}s` };
            const className = i > percent || !this.state.animate ?
                'progress-bar__bar__locked' : 'progress-bar__bar__unlocked';
            blocks.unshift(
                <div className={className} style={style} />
            );
            i -= inc;
            delay -= delayInc;
        }
        return (
            <div className='progress-bar' title={msg}>
                <div className='progress-bar__bar'>
                    {blocks}
                </div>
                <div className='app__content progress-bar__label'>
                    Complete the word bank &gt;&gt;&gt;</div>
            </div>
        );
    }
}
