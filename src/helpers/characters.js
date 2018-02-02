import { isTooEasy } from './difficulty-ratings';

export function removeCharactersThatAreTooEasy(difficultyRatings, chars) {
    return chars.filter(char => !isTooEasy(difficultyRatings, char));
}
