/**
 * Record what the last action was!
 */
export default (state = false, action) => {
    return action.type;
};
