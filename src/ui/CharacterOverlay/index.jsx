/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import FlashCard from './../Card';
import './styles.less';

class Decompositions extends Component {
    render(props) {
        const decomp = props.decompositions;
        const level = props.level || 2;
        let childDecompositions = [];
        decomp.forEach((d) => {
            childDecompositions = childDecompositions.concat(d.decompositions);
        });
        return (
            <div className='app__overlay__decompositions'>
                {
                    decomp.length > 0 && (
                        decomp.map((cardProps) => {
                            const isSmall = level > 2;
                            const english = isSmall ? false : cardProps.english;
                            return <FlashCard {...cardProps} isSelected isFrozen
                                isSmall={isSmall} debug={false} english={english}
                                className='app__overlay__decompositions__card'
                                onExpandCard={false}
                                key={`card-highlighted-${cardProps.character}`} />;
                        })
                    )
                }
                {
                    childDecompositions.length > 0 &&
                    <Decompositions decompositions={childDecompositions} level={level + 1} />
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
                <FlashCard {...props} isSmall={false} isSelected isFrozen debug={false}
                    onExpandCard={false}
                    className='app__overlay__card' />
                <a href={`https://en.wiktionary.org/wiki/${props.character}`}
                    className='app__overlay__link'>wiktionary</a>
                {props.children}
                <TabGroup>
                    {
                        decomp.length > 0 && (
                            <Tab name='Divide/Concur'>
                                <Decompositions decompositions={decomp} />
                            </Tab>
                        )
                    }
                    {
                        props.translations.length > 1 && (
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
