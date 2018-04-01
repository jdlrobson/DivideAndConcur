/** @jsx h */
import { h } from 'preact';
import './styles.less';
import img from './panda.gif';

const BootScreen = (props) => {
    const className = props.className || '';
    return (
        <div className={`boot-screen ${className}`}>
            <div className='boot-screen__msg'>Booting the game...</div>
            <img className='boot-screen__img'
                src={img} alt='panda rolling' />
            <a className='boot-screen__source-link'
                href='https://giphy.com/gifs/keep-rollin-EatwJZRUIv41G'>giphy</a>
        </div>
    );
};

export default BootScreen;
