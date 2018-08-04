/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import FlashCard from './../Card';
import './styles.less';

class Carousel extends Component {
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
        this.setState( { active: i } )
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

class Decompositions extends Component {
    getDecompCards(decomp) {
        let childDecompositions = [];
        decomp.forEach((d) => {
            childDecompositions = childDecompositions.concat(d.decompositions);
        });
        return childDecompositions.length > 0 ? decomp.concat([ '*' ])
            .concat(this.getDecompCards(childDecompositions)) : decomp;
    }
    render(props) {
        const decomp = props.decompositions;

        return (
            <div className='app__overlay__decompositions'>
                {
                    this.getDecompCards(decomp).map((cardProps) => {
                        return cardProps === '*' ? <span className='cut'>÷</span> :
                            <FlashCard {...cardProps} isSelected isFrozen
                                english={cardProps.english}
                                className='app__overlay__decompositions__card'
                                onExpandCard={false}
                                key={`card-highlighted-${cardProps.character}`} />;
                    })
                }
            </div>
        );
    }
}

class Tab extends Component {
    render(props) {
        return (
            <div className='tab'>
                {props.children}
            </div>
        );
    }
}

class TabGroup extends Component {
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

class CharacterOverlay extends Component {
    render(props) {
        const blurb = props.text || '';
        const decomp = props.decompositions || [];
        return (
            <div className='app__overlay'>
                <FlashCard {...props} isSmall={false} isSelected isFrozen debug={true}
                    onExpandCard={false}
                    className='app__overlay__card' />
                <a href={`https://en.wiktionary.org/wiki/${props.character}`}
                    target='_blank'
                    className='app__overlay__link'>wiktionary</a>
                {props.children}
                <TabGroup>
                    {
                        props.usedBy.length && (
                            <Tab name='Used by'>
                                <div className='app__overlay__decompositions'>
                                   <Carousel>
                                    {props.usedBy.map(props => <FlashCard {...props}
                                                isSmall={true}
                                                className='app__overlay__decompositions__card'
                                                onExpandCard={false}
                                                key={`card-highlighted-usedby-${props.character}`} />
                                    )}
                                    </Carousel>
                                </div>
                            </Tab>
                        )
                    }
                    {
                        decomp.length > 0 && (
                            <Tab name='Divide/Concur'>
                                <Decompositions decompositions={decomp} />
                            </Tab>
                        )
                    }
                    {
                        (
                            <Tab name='Translations'>
                                <div className='translations'>
                                    This word has multiple meanings:
                                    <ul>{
                                        props.translations.map(
                                            translation => (<li>{translation}</li>)
                                        )
                                    }</ul>
                                </div>
                            </Tab>
                        )
                    }
                    { Boolean(blurb) && (
                        <Tab name='More info'>
                            <div className='app__overlay__blurb'>{
                                blurb.split('\n').map(text => <p>{text}</p>)
                            }</div>
                        </Tab>
                    )}
                </TabGroup>
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    return Object.assign({}, props, { });
};

const mapDispatchToProps = (dispatch, props) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(CharacterOverlay);
