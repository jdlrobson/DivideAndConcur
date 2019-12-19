/** @jsx h */
import { Component, h } from 'preact';
import Overlay from './Overlay';
import Button from './Button';
import { VERSION } from '../constants';
import { DATA_MODIFIED_LAST } from '../helpers/cards';

const AboutOverlay = ({ onClickExit }) => {
    return <Overlay>
        <p>
            Qie Qie was made by <a href="https://jdlrobson.com">Jon Robson</a> and <a href="https://linzybearswings.wordpress.com/">Linz Lim</a>.
        </p>
        <p>The version of the game you are playing is <em>{VERSION}-{DATA_MODIFIED_LAST}</em>.</p>
        <h2>Attribution</h2>
        <p>about icon by <a href="https://thenounproject.com/kidilandon/collection/dash-line-iconset/">kidilandon</a> from the noun project.</p>
        <Button className='app__overlay__button'
                    onClick={onClickExit}>Got it!</Button>
    </Overlay>
}

export default AboutOverlay;
