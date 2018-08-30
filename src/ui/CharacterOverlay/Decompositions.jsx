/** @jsx h */
import { Component, h } from 'preact';
import FlashCard from './../Card';

export default class Decompositions extends Component {
    render(props) {
        const decomp = props.decompositions;

        return (
            <div className="decompositions">{
                decomp.map( ( decomp ) => {
                    return <FlashCard {...decomp} isSelected={true}
                        className='app__overlay__decompositions__card'
                        isKnown={false}
                        isFrozen={true} isAnswered={true} />;
                } )
            }</div>
        );
    }
}
