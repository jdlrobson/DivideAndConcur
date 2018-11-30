export function className(block, element, modifiers = []) {
    let blockElement = block;
    if (element) {
        blockElement += `__${element}`;
    }
    return `${blockElement} ${modifiers.map((modifier) => {
        return `${blockElement}--${modifier}`;
    }).join(' ')}`;
}
