/** @jsx h */
import { h } from 'preact';

const Header = ({ logo }) => {
    return (
        <div className='chrome__header'>
            <div className='chrome__header__home'>
                <a href='/'>
                    <img src={logo} alt='Divide and concur'
                        width='320'
                        className='chrome__header__home__logo' />
                </a>
            </div>
        </div>
    );
};

const ChromeContent = ( { children, name} ) => {
    return (
        <div className='chrome__content'
            id={`chrome__content__panel-${name}`}>
            { children }
        </div>
    );
};

export default ({ logo, children }) => {
    return (
        <div className='chrome'>
            <Header logo={logo} />
            <ChromeContent name='one'>
                {children}
            </ChromeContent>
            <div id='container' class='chrome__content'  style='display: none;'>
                <ChromeContent name='two' />
            </div>
        </div>
    );
};
