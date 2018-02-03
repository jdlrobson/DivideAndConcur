/** @jsx h */
import { FLIP_CARDS, MATCH_PAIRS, MATCH_PAIRS_REVISE, REVISE } from './constants';
import { getDifficultyRating, getKnownWordCount, knowsWord } from './helpers/difficulty-ratings';
import { markWordAsDifficult, markWordAsEasy } from './reducers/difficulty-ratings';
import DictionaryUtils from './../data/DictionaryUtils';
import actionTypes from './actionTypes';
import dictJson from './../data/dictionary.json';
import { removeCharactersThatAreTooEasy } from './helpers/characters';

const NUM_CARDS_PER_LEVEL = 10;
const MAX_DIFFICULTY = 20;
const dictUtils = new DictionaryUtils(dictJson.words,
    dictJson.decompositions, dictJson.difficulty, dictJson.pinyin);

const ALL_WORDS = dictUtils.all();

// Setups state with the required globals for managing a game
function actionBoot(state, action) {
    return setGame({ answers: action.userData.answers || {} }, { game: false });
}

// clears the current overlay
function clearOverlay(state) {
    return Object.assign({}, state, {
        overlay: null
    });
}

function addHighlightedCards(state, char) {
    const highlighted = makeCardsFromCharacters(state, dictUtils.decompose(char));
    return Object.assign({}, state, {
        highlighted
    });
}

// Reducer for when a card is answered
function actionAnswerCard(state, action) {
    const char = action.character;
    const isAnswered = true;
    let isKnown = true;
    let answers;

    switch (action.type) {
        case actionTypes.GUESS_FLASHCARD_WRONG:
            answers = markWordAsDifficult(getDifficultyRatings(state), char);
            isKnown = false;
            break;
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            answers = markWordAsEasy(getDifficultyRatings(state), char);
            break;
        default:
            break;
    }

    return addHighlightedCards(Object.assign({}, state, {
        answers,
        cards: updateCardInCards(state.cards, action, { isAnswered, isKnown }),
        previous: state.previous
    }), char);
}

function mapCard(state, character) {
    const difficultyLevel = getDifficultyRating(getDifficultyRatings(state), character);
    return {
        isKnown: knowsWord(getDifficultyRatings(state), character),
        character,
        difficultyLevel,
        level: `${dictUtils.getWordLength(character)}.${dictUtils.getDifficultyRating(character)}`,
        pinyin: dictUtils.getPinyin(character),
        english: dictUtils.getWord(character)
    };
}

function addKnownWordCount(state) {
    const knownWordCount = getKnownWordCount(getDifficultyRatings(state));
    return Object.assign({}, state, { knownWordCount });
}

function makeCardsFromCharacters(state, chars) {
    return chars.map(char => mapCard(state, char));
}

function findPackStartPosition(answers, pack) {
    let i = 0;
    while (knowsWord(answers, pack[i])) {
        i += 1;
    }
    return i;
}

function getDifficultyRatings(state) {
    return state.answers;
}

function fastForwardToPackPosition(state) {
    let difficulty = state.difficulty;
    let wordSize = state.wordSize;
    const pack = dictUtils.getWords(wordSize, difficulty);
    const packPosition = findPackStartPosition(getDifficultyRatings(state), pack);
    const previous = state.previous || [];
    if (difficulty >= MAX_DIFFICULTY * (wordSize + 1)) {
        wordSize = 1;
        difficulty = 0;
    }

    if (pack.length === 0 && difficulty > MAX_DIFFICULTY) {
    // we ran out on this difficulty (there may be more but they are unreachable with current words)
    // given assumption every difficulty has at least one word
        return fastForwardToPackPosition(Object.assign({}, state, {
            wordSize: wordSize + 1,
            previous: pack.concat(previous),
            difficulty: 0
        }));
    } else if (packPosition >= pack.length) {
        return fastForwardToPackPosition(Object.assign({}, state, {
            wordSize,
            previous: pack.concat(previous),
            difficulty: difficulty + 1
        }));
    } else {
        return Object.assign({}, state, {
            pack,
            previous,
            packPosition,
            wordSize,
            difficulty
        });
    }
}

function dealKnownCards(state, total) {
    const known = ALL_WORDS.filter(char => knowsWord(getDifficultyRatings(state), char));
    const cards = makeCardsFromCharacters(state, known);
    return Object.assign({}, state, { cards, previous: [] });
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
        state,
        removeCharactersThatAreTooEasy(
            getDifficultyRatings(state),
            pack.slice(packPosition, packPosition + total)
        )
    );
    const answeredCardsInCurrentPack = pack.slice(0, packPosition);
    const previous = makeCardsFromCharacters(state,
        answeredCardsInCurrentPack.concat(position.previous));

    // if all have been answered lets deal again..
    return Object.assign({}, state, position, {
        cards, previous
    });
}

function setGame(state, action) {
    return newRound(Object.assign({}, state, {
        game: action.game,
        highlighted: [],
        previous: [],
        cards: [],
        maxSize: ALL_WORDS.length
    }));
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
    return addTimedAction(state, actionTypes.DESELECT_ALL_UNANSWERED_CARDS, 2000);
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
            const answers = markWordAsEasy(getDifficultyRatings(state), char);
            const cards = markCardsAsAnswered(state.cards, char, true);
            return addHighlightedCards(Object.assign({}, state, { cards, answers }), char);
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
    return Object.assign({}, state, { isDirty: true });
}
function saveDone(state) {
    return Object.assign({}, state, { isDirty: false });
}

function cutCardDeck(state, total) {
    const cards = state.cards.slice(0,total);
    return Object.assign({}, state, { cards });
}

function newRound(state) {
    state = addKnownWordCount(state);

    if (state.game === MATCH_PAIRS) {
        state = dealCards(state, 6);
    } else if (state.game === MATCH_PAIRS_REVISE) {
        state = cutCardDeck(shuffleCards(dealKnownCards(state)), 6);
    } else if (state.game === FLIP_CARDS) {
        state = dealCards(state, 9);
    } else if (state.game === REVISE) {
        state = cutCardDeck(shuffleCards(dealKnownCards(state)), 9);
    }

    switch (state.game) {
        case MATCH_PAIRS:
        case MATCH_PAIRS_REVISE:
            state = flipCardStart(shuffleCards(freezeCards(cloneCards(state))));
            break;
        default:
            break;
    }

    return requestSave(addIndexToCards(state));
}
function flipCards(state) {
    const cards = state.cards.map(card => Object.assign({}, card,
        { isFlipped: true, isSelected: false }));
    return Object.assign({}, state, { cards, isFlipped: true });
}

function flipCardStart(state, action) {
    return Object.assign({}, state, { isFlipped: false });
}

export default (state, action) => {
    switch (action.type) {
        case actionTypes.FLIP_CARDS_START:
            return pausePlay(flipCardStart(state, action));
        case actionTypes.FLIP_CARDS_END:
            return resumePlay(flipCards(state));
        case actionTypes.SAVE_COMPLETE:
            return saveDone(state);
        case actionTypes.DESELECT_ALL_UNANSWERED_CARDS:
            return actionDeselectUnansweredCards(state, action);
        case actionTypes.CLEAR_TIMED_ACTION:
            return Object.assign({}, state, { timedAction: undefined,
                timedActionDuration: undefined });
        case actionTypes.END_ROUND:
        case actionTypes.START_ROUND:
            return newRound(state);
        case actionTypes.GUESS_FLASHCARD_WRONG:
        case actionTypes.GUESS_FLASHCARD_RIGHT:
            return actionAnswerCard(state, action);
        case actionTypes.BOOT:
            return actionBoot(state, action);
        default:
            break;
    }
    // All these actions are user driven and will not work if paused.
    if (!action.isPaused) {
        switch (action.type) {
            case actionTypes.DISMOUNT_GAME:
                return setGame(state, { game: false });
            case actionTypes.REVEAL_FLASHCARD:
                return state.isPaused ? state : revealedFlashcard(state, action);
            case actionTypes.SWITCH_GAME:
                return setGame(state, action);
            case actionTypes.GUESS_FLASHCARD_WRONG:
            case actionTypes.GUESS_FLASHCARD_RIGHT:
                return actionAnswerCard(state, action);
            case actionTypes.CLICK_ROOT_NODE:
                return clearOverlay(state);
            default:
                break;
        }
    }
    return state;
};

