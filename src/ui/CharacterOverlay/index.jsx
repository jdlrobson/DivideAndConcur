/** @jsx h */
import { Component, h } from 'preact';
import { connect } from 'preact-redux';
import FlashCard from './../Card';
import Overlay from './../Overlay';
import Carousel from './Carousel';
import Tab from './Tab';
import TabGroup from './TabGroup';
import Decompositions from './Decompositions';

import './styles.less';

class CharacterOverlay extends Component {
    render(props) {
        const character = props.character;
        const blurb = props.text || '';
        const decomp = props.decompositions || [];
        let translationMsg;
        if (props.translations.length > 1) {
            translationMsg = 'This word has multiple meanings';
        } else if (props.translations.length === 0) {
            translationMsg = 'No translations available';
        } else {
            translationMsg = 'This word means:';
        }
        return (
            <Overlay>
                {!character && <p>I don't know word you search for.</p>}
                {character && <FlashCard {...props} isSmall={false} isSelected isFrozen debug={true}
                    onExpandCard={false}
                    className='app__overlay__card' />}
                {character && <a href={`https://en.wiktionary.org/wiki/${props.character}`}
                    target='_blank'
                    className='app__overlay__link'>wiktionary</a>}
                {props.children}
                {character && <TabGroup>
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
                                    <span>{translationMsg}</span>
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
                </TabGroup>}
            </Overlay>
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
