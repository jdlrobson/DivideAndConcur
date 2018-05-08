/** @jsx h */
import { Component, h } from 'preact';
import { FlashCard } from './../Card';
import Button from './../Button';

const Panel = ({ id, children }) => {
    return (
        <div id={id} className='panel'>
            {children}
        </div>
    );
};

const medicineDecomp = [
    <FlashCard character='纟' english='silk radical' isSmall={true} className='panel__card' />,
    <FlashCard character='勺' english='spoon radical' isSmall={true} className='panel__card' />,
    <FlashCard character='艹' english='grass radical' isSmall={true} className='panel__card' />
];

export default class StoryPanel extends Component {
    render(props) {
        return (
            <div className='panel-wrapper'>
                <Panel id='panel-1'>
                    <p>I made this game because I thought it would be
                        impossible to learn Mandarin.</p>
                    <p>It was so different from any other language I had
                  seen.</p>
                    <p>I read somewhere that I needed to learn 3000 characters
                        to be able to read a newspaper.</p>
                    <p>I couldn't imagine speaking it!</p>
                    <p>I didn't know where to begin.</p>
                    <a className='panel__next' href='#panel-2'>Next</a>
                </Panel>
                <Panel id='panel-2'>
                    <p>I started looking at this character:</p>
                    <FlashCard character='药' pinyin='yào' />
                    <p>What could this strange character mean?</p>
                    <hr className='panel__break' />
                    <p>Since I was a child, I've always been intrigued by
                        the art of taking things apart.</p>
                    <p>I've disassembled typewriters; computers; stanzas in beautiful poems;
                        to try and understand how they work.</p>
                    <p>I wondered if it worked with Chinese characters.</p>
                    <a className='panel__next'href='#panel-3'>Next</a>
                </Panel>
                <Panel id='panel-3'>
                    <p>I cut the word apart until I can cut it no more.</p>
                    <FlashCard character='药' pinyin='yào' />
                    <hr className='panel__break' />
                    <p>Three new characters appeared. They were much simpler to read;
                        to remember; to learn.</p>
                    {medicineDecomp}
                    <hr className='panel__break' />
                    <a className='panel__next' href='#panel-4'>Next</a>
                </Panel>
                <Panel id='panel-4'>
                    <p>I learned my first word.</p>
                    <FlashCard character='药' english='medicine' pinyin='yào' isSmall={true} />
                    <p>I remembered it by the visual of eating grass with a silk spoon.</p>
                    <hr className='panel__break' />
                    <p>I put the silk spoon together and learned another new word:</p>
                    <FlashCard character='约' english='appointment' pinyin='yuē' />
                    <hr className='panel__break' />
                    <p>Medicine was now an appointment with grass.</p>
                    <a className='panel__next' href='#panel-5'>Next</a>
                </Panel>
                <Panel id='panel-5'>
                    <p>I knew <strong>five</strong> characters now!</p>
                    {medicineDecomp}
                    <FlashCard character='约' english='appointment'
                        isSmall={true} className='panel__card' />
                    <FlashCard character='药' english='medicine'
                        isSmall={true} className='panel__card' />
                    <hr className='panel__break' />
                    <p>I wondered if I could learn the smaller characters to
                  remember all the big ones.</p>
                    <a className='panel__next'  href='#panel-6'>Next</a>
                </Panel>
                <Panel id='panel-6'>
                    <p>Play my game every day on your commute to work to
                        become confident in Mandarin.</p>
                    <p>Are you ready!?!</p>
                    <p>准备好了吗!?!</p>
                    <Button id='init-game'>Let's play!</Button>
                    <a className='panel__next' href='#panel-1'>Read why I made this game</a>
                </Panel>
            </div>
        );
    }
}
