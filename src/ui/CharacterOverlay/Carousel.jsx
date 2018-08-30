/** @jsx h */
import { Component, h } from 'preact';

export default class Carousel extends Component {
    constructor(props) {
        super();
        this.state = { active: 0, items: props.children.length };
    }
    setActive(i) {
        const total = this.state.items;
        if ( i >= total ) {
            i = 0;
        }
        if ( i < 0 ) {
            i = total - 1;
        }
        this.setState( { active: i } );
    }
    onNext() {
        this.setActive(this.state.active + 1);
    }
    onPrev() {
        this.setActive(this.state.active - 1);
    }
    render() {
        const children = this.props.children;
        return (
            <div className="carousel">
                {children.length > 1 && <div onClick={this.onPrev.bind(this)}>⬅️</div>}
                {children[this.state.active || 0]}
                {children.length > 1 && <div onClick={this.onNext.bind(this)}>➡️</div>}
            </div>
        )
    }
}
