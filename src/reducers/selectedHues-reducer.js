export const HUE_ACTIONS = {
    ADD_HUE: 'ADD_HUE',
    REMOVE_HUE: 'REMOVE_HUE',


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
    
        default: 
            return state;

    }


}