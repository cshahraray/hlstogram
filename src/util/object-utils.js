//takes an object where values are arrays
//returns key and length of longest and shortest values
export const getShortestLongest = (object) => {
    const keys = Object.keys(object);
    const lastKey = parseInt(keys.slice(-1));

    let i = parseInt(keys[0])

    let longestKey = i;
    let shortestKey = i;
    let longestLength = object[i].length;
    let shortestLength = object[i].length;

    while (i <= lastKey) {
        if (object[i] && object[i].length > longestLength) {
            longestKey = i;
            longestLength = object[i].length
        } else if (object[i] && object[i].length < shortestLength) {
            shortestKey = i;
            shortestLength = object[i].length
        }
        i++;
    }

    return [shortestLength, longestLength]

}