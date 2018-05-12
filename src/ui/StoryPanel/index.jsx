/** @jsx h */
import { Component, h } from 'preact';
import { FlashCard } from './../Card';
import MatchPairs from './../MatchPairs';
import ProgressBar from './../ProgressBar';

import './styles.less';

const totalPanels = 7;

const qie = <FlashCard character='切' english='cut / slice' pinyin='qiē'
    isSmall={true} className='panel__card' />;

const qiefen = <FlashCard character='切分' english='cut / separate'
    pinyin='qiē fēn' isWide={false}
    isSmall={true} className='panel__card' />;

const qieji = <FlashCard character='切记' english='bear in mind'
    pinyin='qiè jì' isWide={false}
    isSmall={true} className='panel__card' />;

const PanePositionBar = ({ selected }) => {
    return (
        <div className='pane-position-bar'>
            {Array(totalPanels).fill(0).map((_, i) =>
                <span className={`pane-position-bar__circle${
                    selected === i ? " pane-position-bar__circle--active" : ""}`} />
            )}
        </div>
    );
};
const Panel = ({ id, children }) => {
    const lastPanelId = totalPanels - 1;
    let label = id === lastPanelId ? 'About this game' : 'Next';
    const nextId = id === lastPanelId ? 1 : id + 1;
    const isFixed = id !== lastPanelId;
    const showPanelProgress = id < totalPanels - 2;

    if (id === totalPanels - 2) {
        label = 'Yes! Play game!';
    }
    return (
        <div id={`panel-${id}`} className='panel'>
            {children}
            <PanelButton isFixed={isFixed} href={`#panel-${nextId}`}>
                { showPanelProgress && <PanePositionBar selected={id} /> }{label}
            </PanelButton>
        </div>
    );
};

const medicineDecomp = [
    <FlashCard character='纟' english='silk radical' isSmall={true} className='panel__card' />,
    <FlashCard character='勺' english='spoon radical' isSmall={true} className='panel__card' />,
    <FlashCard character='艹' english='grass radical' isSmall={true} className='panel__card' />
];

const PanelButton = ({ href, children, isFixed }) => {
    const className = isFixed ? 'panel__next panel__next--fixed' : 'panel__next';
    return (
        <a className={className} href={href}>
            {children}
        </a>
    );
};

export default class StoryPanel extends Component {
    render(props) {
        return (
            <div className='panel-wrapper'>
                <Panel id={0}>
                    <p>I made this game because I thought it would be
                        impossible to learn Mandarin.</p>
                    <p>It was so different from any other language I had
                  seen.</p>
                    <p className='panel__highlighted-text'>I read somewhere that
                        I needed to learn 3000 characters
                        to be able to read a newspaper.</p>
                    <p>I couldn't imagine speaking it!</p>
                    <p>How to learn so many?</p>
                </Panel>
                <Panel id={1}>
                    <p>Since I was a child, I've always been intrigued by
                        the art of taking things apart.</p>
                    <p>I've disassembled typewriters; computers; stanzas in beautiful poems;
                        to try and understand how they work.</p>
                    <p>I wondered if it worked with Chinese characters.</p>
                    <p className='panel__highlighted-text'>Staring at this character,
                        I wondered what it could mean.</p>
                    <MatchPairs mode={4}>
                        <FlashCard character='药' pinyin='yào' />
                    </MatchPairs>
                </Panel>
                <Panel id={2}>
                    <p><span className='panel__highlighted-text'>I cut the word apart until I could
                        cut it no more.</span>Three characters appeared.</p>
                    <MatchPairs mode={4}>{medicineDecomp}</MatchPairs>
                    <p>With these I learnt my first cut up character.
                        I remember the character, <strong>MEDICINE</strong>,
                        with the visual of <span className='panel__highlighted-text'>
                            eating GRASS with a SILK spoon!</span></p>
                    <p>I put the silk spoon together and learned another new word:</p>
                    <MatchPairs mode={4}>
                        <FlashCard character='约' english='appointment' pinyin='yuē' />
                    </MatchPairs>
                </Panel>
                <Panel id={3}>
                    <p>Not only did <span className='panel__highlighted-text'>MEDICINE become
                        an APPOINTMENT with GRASS</span>, I know was familiar with five
                        Chinese characters!</p>
                    <MatchPairs mode={4}>
                        {medicineDecomp}
                        <FlashCard character='约' english='appointment'
                            isSmall={true} className='panel__card' />
                        <FlashCard character='药' english='medicine'
                            isSmall={true} className='panel__card' />
                    </MatchPairs>
                    <p>I wondered if I could learn the smaller characters to
                  remember all the big ones.</p>
                </Panel>
                <Panel id={4}>
                    <p>It was fun breaking the characters apart. I started calling this game:</p>
                    <MatchPairs mode={4}>{qie}</MatchPairs>
                    <p>To my horror not only could one character have multiple meanings, they could
                        produce different sounds and become many different words!</p>
                    <MatchPairs mode={4}>{[qiefen, qieji]}</MatchPairs>
                    <p className='panel__highlighted-text'>Time for a deep, deep breath!</p>
                </Panel>
                <Panel id={5}>
                    <ProgressBar known={0} total={100} noLabel={true} />
                    <p>I created a word bank. I will not be intimidated by the unknown.</p>
                    <ProgressBar known={60} total={100} noLabel={true} animate={true} />
                    <p><span className='panel__highlighted-text'>One step</span> at a time
                        I will get to know this language.</p>
                    <p>I will <strong>bear in mind</strong> that there is always more to learn than
                        just these. I make a note (+) for later.</p>
                    <p>Are you ready to play?</p>
                </Panel>
                <Panel id={6}>
                    <ProgressBar known={0} total={100} noLabel={true} />
                    <div id='init-game'>
                        <MatchPairs mode={4} showHint={true}>
                            <FlashCard /><FlashCard /><FlashCard /><FlashCard />
                            <FlashCard /><FlashCard />
                        </MatchPairs>
                    </div>
                </Panel>
            </div>
        );
    }
}
