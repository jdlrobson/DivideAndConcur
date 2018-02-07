/** @jsx h */
import { Component, h } from 'preact';
import './styles.less'

const BootScreen = (props) => {
    const className = props.className || '';
    return (
        <div className={'boot-screen ' + className}>
         Booting!
        </div>
    )
};

export default BootScreen;
