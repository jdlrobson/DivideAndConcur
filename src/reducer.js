/** @jsx h */
import { FLIP_CARDS, MATCH_PAIRS, REVISE } from './ui/GameChooser';

import CharacterPreviewOverlay from './ui/CharacterPreviewOverlay';
import DictionaryUtils from './../data/DictionaryUtils';
import Memory from './Memory';
import actionTypes from './actionTypes';
import dictJson from './../data/dictionary.json';
import { h } from 'preact';

const NUM_CARDS_PER_LEVEL = 10;
const MAX_DIFFICULTY = 11;
let memory;
const dictUtils = new DictionaryUtils(dictJson.words,
    dictJson.decompositions, dictJson.difficulty, dictJson.pinyin);

const ALL_WORDS = dictUtils.all();

// Setups state with the required globals for managing a game
function actionBoot(state, action) {
    memory = new Memory(action.userData);

    return setGame();
}

// updates state to add the character preview overlay overlay
function actionRevealPronounciation(state, action) {
    const char = action.character;
    const characterRequested = action.type === actionTypes.REQUEST_PINYIN_START ?
        char : undefined;

    return Object.assign({}, state, {
        characterRequested,
        overlay: <CharacterPreviewOverlay char={char} pinyin={action.pinyin} />
    });

}

// clears the current overlay
function clearOverlay(state) {
    return Object.assign({}, state, {
        overlay: null
    });
}

// Reducer for when a card is answered
function actionAnswerCard(state, action) {
    const char = action.character;
    const isAnswered = true;
    let isKnown = true;
    const highlighted = dictUtils.decompose(char);

    switch (action.type) {
        case actionTypes.GUESS_FLASHCARD_WRONG.type:
            memory.markAsDifficult(char);
            isKnown = false;
            break;
        case actionTypes.GUESS_FLASHCARD_RIGHT.type:
            memory.markAsEasy(char);
            break;
        default:
            break;
    }

    return Object.assign({}, state, {
        highlighted,
        cards: updateCardInCards(state.cards, action, { isAnswered, isKnown }),
        previous: state.previous
    });
}

function mapCard(character) {
    const difficultyLevel = memory.getDifficulty(character);
    return {
        isKnown: memory.knowsWord(character),
        character,
        difficultyLevel,
        level: `${dictUtils.getWordLength(character)}.${dictUtils.getDifficultyRating(character)}`,
        pinyin: dictUtils.getPinyin(character),
        english: dictUtils.getWord(character)
    };
}

function addKnownWordCount(state) {
    const prev = state.previous;
    const cards = state.cards;
    const knownWordCount = cards.filter(card => card.isKnown).length + prev.length;

    return Object.assign({}, state, { knownWordCount });
}

function makeCardsFromCharacters(state, chars) {
    return chars.map(char => mapCard(char));
}

function findPackStartPosition(pack) {
    let i = 0;
    while (memory.knowsWord(pack[i])) {
        i += 1;
    }
    return i;
}

function fastForwardToPackPosition(state) {
    let difficulty = state.difficulty;
    let wordSize = state.wordSize;
    const pack = dictUtils.getWords(wordSize, difficulty);
    const packPosition = findPackStartPosition(pack);
    const previous = state.previous || [];
    if (difficulty >= MAX_DIFFICULTY * (wordSize + 1)) {
        wordSize = 1;
        difficulty = 0;
    }

    if (pack.length === 0 && difficulty > MAX_DIFFICULTY) {
    // we ran out on this difficulty (there may be more but they are unreachable with current words)
    // given assumption every difficulty has at least one word
        return fastForwardToPackPosition({
            wordSize: wordSize + 1,
            previous: pack.concat(previous),
            difficulty: 0
        });
    } else if (packPosition >= pack.length) {
        return fastForwardToPackPosition({
            wordSize,
            previous: pack.concat(previous),
            difficulty: difficulty + 1
        });
    } else {
        return {
            pack,
            previous,
            packPosition,
            wordSize,
            difficulty
        };
    }
}

function dealKnownCards(state, total) {
    const known = ALL_WORDS.filter(char => memory.knowsWord(char));
    const cards = makeCardsFromCharacters(state, known);
    return addKnownWordCount(Object.assign({}, state, { cards, previous: [] }));
}
/**
 * Deal ten cards from the dictionary that the user is unfamiliar with
 * sorted by difficulty level
 */
function dealCards(state, total = NUM_CARDS_PER_LEVEL) {
    const position = fastForwardToPackPosition(Object.assign({}, state,
        { difficulty: 0, wordSize: 0, previous: [] }));
    const pack = position.pack;
    const packPosition = position.packPosition;
    const cards = makeCardsFromCharacters(
        state, pack.slice(packPosition, packPosition + total)
    );
    const answeredCardsInCurrentPack = pack.slice(0, packPosition);
    const previous = makeCardsFromCharacters(state,
        answeredCardsInCurrentPack.concat(position.previous));

    // if all have been answered lets deal again..
    return addKnownWordCount(
        Object.assign({}, state, position, {
            cards, previous
        })
    );
}

function setGame(state, action) {
    return newRound({
        game: action ? action.game : FLIP_CARDS,
        highlighted: [],
        previous: [],
        cards: [],
        maxSize: ALL_WORDS.length
    });
}

function updateCardInCards(cards, action, props) {
    return cards.map((card, i) => {
        return action.character === card.character &&
          action.index === i ?
            Object.assign({}, card,  props) : card;
    });
}

function markCardsAsAnswered(cards, character, isKnown) {
    return cards.map((card, i) => {
        return character === card.character ?
            Object.assign({}, card,  { isAnswered: true, isKnown }) : card;
    });
}

function deselectUnansweredCards(cards) {
    return cards.map((card, i) => {
        return card.isSelected && !card.isAnswered ?
            Object.assign({}, card,  { isSelected: false }) : card;
    });
}

function resumePlay(state) {
    return Object.assign({}, state, { isPaused: false });
}

function pausePlay(state) {
    return Object.assign({}, state, { isPaused: true });
}

function addTimedAction(state, timedAction, timedActionDuration) {
    return pausePlay(Object.assign({}, state, {
        timedAction,
        timedActionDuration })
    );
}

function queueDeselectOfUnansweredCards(state) {
    return addTimedAction(state, actionTypes.DESELECT_ALL_UNANSWERED_CARDS.type, 2000);
}

function actionDeselectUnansweredCards(state) {
    return resumePlay(
        Object.assign({}, state, {
            cards: deselectUnansweredCards(state.cards)
        })
    );
}

function revealCardInAction(state, action) {
    return Object.assign({}, state, {
        cards: updateCardInCards(state.cards, action, { isSelected: true })
    });
}

function revealedFlashcardPairGame(state, action) {
    state = revealCardInAction(state, action);
    const selectedCards = state.cards.filter(card => card.isSelected && !card.isAnswered);
    if (selectedCards.length === 2) {
        if (selectedCards[0].character === selectedCards[1].character) {
            const char = action.character;
            memory.markAsEasy(char);
            const cards = markCardsAsAnswered(state.cards, char, true);
            const highlighted = dictUtils.decompose(char);
            return Object.assign({}, state, { cards, highlighted });
        } else {
            return queueDeselectOfUnansweredCards(pausePlay(state));
        }
    }
    return state;
}

function revealedFlashcard(state, action) {
    if (state.game === MATCH_PAIRS) {
        return revealedFlashcardPairGame(state, action);
    }  else {
        return revealCardInAction(state, action);
    }
}

function freezeCards(state) {
    const isFrozen = true;
    return Object.assign({}, state, {
        cards: state.cards.map(card => Object.assign({}, card, { isFrozen }))
    });
}

function shuffleCards(state) {
    return Object.assign({}, state, {
        cards: state.cards.sort((a,b) => { return Math.random() < 0.5 ? -1 : 1; })
    });
}
function cloneCards(state) {
    const cards = state.cards;
    return Object.assign({}, state, {
        cards: cards.concat(cards)
    });
}

function addIndexToCards(state) {
    return Object.assign({}, state, {
        cards: state.cards.map((card, i) => Object.assign({}, card, { index: i }))
    });
}

function requestSave(state) {
    return Object.assign({}, state, { isDirty: true, dataToSave: memory.toJSON() });
}
function saveDone(state) {
    return Object.assign({}, state, { isDirty: false, dataToSave: undefined });
}

function cutCardDeck(state, total) {
    const cards = state.cards.slice(0,total);
    return Object.assign({}, state, { cards });
}

function newRound(state) {
    if (state.game === MATCH_PAIRS) {
        return requestSave(
            addIndexToCards(shuffleCards(freezeCards(cloneCards(dealCards(state, 6)))))
        );
    } else if (state.game === FLIP_CARDS) {
        return requestSave(addIndexToCards(dealCards(state)));
    } else if (state.game === REVISE) {
        return requestSave(addIndexToCards(cutCardDeck(shuffleCards(dealKnownCards(state)), 10)));
    } else {
        throw new Error('unknown game');
    }
}
function flipCards(state) {
    const cards = state.cards.map(card => Object.assign({}, card,
        { isFlipped: true, isSelected: false }));
    return Object.assign({}, state, { cards });
}

function flipCardStart(state, action) {
    return Object.assign({}, state);
}

export default (state, action) => {
    switch (action.type) {
        case actionTypes.FLIP_CARDS_START:
            return pausePlay(flipCardStart(state, action));
        case actionTypes.FLIP_CARDS_END:
            return resumePlay(flipCards(state));
        case actionTypes.SAVE_COMPLETE.type:
            return saveDone(state);
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS.type:
            return actionDeselectUnansweredCards(state, action);
        case actionTypes.CLEAR_TIMED_ACTION.type:
            return Object.assign({}, state, { timedAction: undefined,
                timedActionDuration: undefined });
        case actionTypes.END_ROUND.type:
        case actionTypes.START_ROUND.type:
            return newRound(state);
        case actionTypes.GUESS_FLASHCARD_WRONG.type:
        case actionTypes.GUESS_FLASHCARD_RIGHT.type:
            return actionAnswerCard(state, action);
        case actionTypes.REQUEST_PINYIN_END.type:
            return actionRevealPronounciation(state, action);
            // reset on boot
        case actionTypes.BOOT.type:
            return actionBoot(state, action);
        default:
            break;
    }
    // All these actions are user driven and will not work if paused.
    if (!action.isPaused) {
        switch (action.type) {
            case actionTypes.REVEAL_FLASHCARD.type:
                return state.isPaused ? state : revealedFlashcard(state, action);
            case actionTypes.SWITCH_GAME.type:
                return setGame(state, action);
            case actionTypes.GUESS_FLASHCARD_WRONG.type:
            case actionTypes.GUESS_FLASHCARD_RIGHT.type:
                return actionAnswerCard(state, action);
            case actionTypes.REQUEST_PINYIN_START:
                return actionRevealPronounciation(state, action);
                // reset on boot
            case actionTypes.CLICK_ROOT_NODE.type:
                return clearOverlay(state);
            default:
                break;
        }
    }
    return state;
};

