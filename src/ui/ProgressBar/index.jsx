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
        const animate = props.animate || this.state.animate;
        const TOTAL_LEVELS = 100;
        const wordsPerLevel = ( props.total / TOTAL_LEVELS );
        const levelPos = props.known / wordsPerLevel;
        const level = Math.ceil( levelPos );
        const percent = Math.floor(
            (levelPos - level + 1) * 100
        );
        const totalPercent = (props.known / props.total) * 100;
        const msg = `${props.known} of ${props.total} words known (${totalPercent}%).`;
        const blocks = [];
        let i = 100;
        const numBlocks = 16;
        const inc = 100 / numBlocks;
        const delayInc = 0.5;
        let delay = delayInc * (numBlocks - 1);
        while (i > 0) {
            const style = { transitionDelay: `${delay}s` };
            const className = i > percent || !animate ?
                'progress-bar__bar__locked' : 'progress-bar__bar__unlocked';
            blocks.unshift(
                <div className={className} style={style} />
            );
            i -= inc;
            delay -= delayInc;
        }
        const wordbankMsg = level ? `Word bank level ${level}` : 'Complete the word bank';
        return (
            <div className='progress-bar' title={msg}>
                <div className='progress-bar__bar'>
                    {blocks}
                </div>
                {!props.noLabel && <div className='app__content progress-bar__label'>
                    {wordbankMsg}  &gt;&gt;&gt;</div>}
                {props.initialKnown < props.known &&
                    <div className='progress-bar__delta'>+{props.known - props.initialKnown}</div>
                }
            </div>
        );
    }
}
