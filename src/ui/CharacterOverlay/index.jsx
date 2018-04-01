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
                    decomp.length > 0 && level === 2 && (<h2>Decompositions</h2>)
                }
                {
                    decomp.length > 0 && (
                        decomp.map((cardProps) => {
                            const isSmall = level > 2;
                            const english = isSmall ? false : cardProps.english;
                            return <FlashCard {...cardProps} isSelected isFrozen
                                isSmall={isSmall} debug={false} english={english}
                                className='app__overlay__decompositions__card'
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

class CharacterOverlay extends Component {
    render(props) {
        const blurb = props.text || '';
        const decomp = props.decompositions || [];
        return (
            <div className='app__overlay'>
                <FlashCard {...props} isSmall={false} isSelected isFrozen
                    className='app__overlay__card' />
                <a href={`https://en.wiktionary.org/wiki/${props.character}`}
                    className='app__overlay__link'>wiktionary</a>
                <Decompositions decompositions={decomp} />
                { Boolean(blurb) && <h2>Using this word</h2> }
                {
                    blurb.split('\n').map(text => <p>{text}</p>)
                }
                {props.children}
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
