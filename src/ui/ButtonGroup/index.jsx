/** @jsx h */
import { h } from 'preact';
import './styles.less';

export default ({ children }) => {
    return <div className='button-group'>{children}</div>;
};
