/** @jsx h */
import { h } from 'preact';
import './styles.less';

export default ({ className = '', onClick }) => {
    return <a className={`${className} expand-button`} onClick={onClick}>+</a>;
};
