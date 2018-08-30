/** @jsx h */
import { Component, h } from 'preact';

export default class TabGroup extends Component {
    constructor() {
        super();
        this.state = { activeTab: 0 };
    }
    switchTab(i) {
        const setState = this.setState.bind(this);
        return (ev) => {
            setState({ activeTab: i });
        };
    }
    render(props) {
        const switchTab = this.switchTab.bind(this);
        const active = this.state.activeTab;
        const nonEmptyChildren = props.children.filter(child => Boolean(child));
        return (
            <div className='tab-group'>
                <div>{
                    nonEmptyChildren.map((child, i) => {
                        return <span className={i === active ?
                            "tabgroup__tab tabgroup__tab--active" : "tabgroup__tab"}
                        onClick={switchTab(i)}>{child.attributes.name}</span>;
                    })
                }</div>
                {nonEmptyChildren[active]}
            </div>
        );
    }
}