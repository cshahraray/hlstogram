export const HUE_ACTIONS = {
    ADD_HUE: 'ADD_HUE',
    REMOVE_HUE: 'REMOVE_HUE',
    RESET_HUES: 'RESET_HUES',
    INVERT_HUES: 'INVERT_HUES'
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

        case HUE_ACTIONS.INVERT_HUES:
            newState = {}
            let prevState = Object.assign({}, state)
            const imgHues = action.imageHues

            let inverted = imgHues.filter( hue => !prevState.hasOwnProperty(hue) )

            inverted.forEach( hue => {
                newState[hue] = true
            });

            return newState
    
        default: 
            return state;

    }


}