export const HUE_ACTIONS = {
    ADD_HUE: 'ADD_HUE',
    REMOVE_HUE: 'REMOVE_HUE',
    RESET_HUES: 'RESET_HUES'
}

export function selectedHuesReducer(state = {}, action) {
    let newState = Object.assign({}, state)
    switch(action.type){
        case HUE_ACTIONS.ADD_HUE:
            for (let i = 0; i < 5; i++) {
                newState[action.hue + i] = true;
            }
            return newState;

        case HUE_ACTIONS.REMOVE_HUE:
            for (let i = 0; i < 5; i++) {
                delete newState[action.hue + i];
            }
            return newState;
        
        case HUE_ACTIONS.RESET_HUES:
            return {}
    
        default: 
            return state;

    }


}