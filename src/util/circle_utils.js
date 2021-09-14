import { hsv2rgb } from "./colorspace_utils";

// import { hsv2rgb } from "./colorspace-utils";


//Circle Math helper methods:
//convert radians to degrees
export const rad2Deg = (radian) => {
    const deg = (radian  * Math.PI/180);
    return deg < 0 ? (360+deg) : deg
}



export const deg2Rad = (degree) => {
    const rad = degree * (Math.PI / 180)

    return rad;
}
export const xy2polar = (x, y) => {
    let r = Math.sqrt(x*x + y*y);
    let phi = Math.atan2(y, x);
    return [r, phi];
}


///get dX dY for distance and angle calculations
//input: [X,Y]; [X,Y]
export const getDeltas = (pointXY, centerXY) => {
    const deltaX = pointXY[0] - centerXY[0];
    const deltaY = pointXY[1] - centerXY[1];

    return [deltaX, deltaY];
}

export const getDist = (deltaXY) => {
    const dXsquared = deltaXY[0] * deltaXY[0];
    const dYsquared = deltaXY[1] * deltaXY[1];

    return Math.round(Math.sqrt(dXsquared + dYsquared));
}

//get angle of arc from center point

export const getAngle = (deltaXY) => {
    return rad2Deg(Math.atan2(deltaXY[0], deltaXY[1]))
}

//given an angle and radius, return the corresponding
//point on circle
export const getCirclePoint = (angle, distance, centerXY) => {
    const y = Math.round(Math.round(Math.cos(deg2Rad(angle)) * distance + centerXY[1]));
    const x = Math.round(Math.round(Math.sin(deg2Rad(angle)) * distance + centerXY[0]));
    
    return [x, y]
}

////given an angle (in degrees) return the
//corresponding color RGB values as string for fill
export const angle2Color = (angle) => {
    const rgbArr = hsv2rgb(angle, .5, .5)
    return `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`
}

//given angle from center and distance from center
//map to hue and saturation values
//return RGB values as strig for fill

//scale distance of controllor from center of wheel
//to saturation values
export const dist2Sat = (dist, diam) => {
    return (dist / (diam/2))
}

export const angleSat2Color = (angle, sat) => {
    let rgbArr
    let v
    sat < .5 ? v= sat : v = 1 - sat
    // if (angle >= 0) {
        rgbArr = hsv2rgb(angle, (sat), 1 - (v * v))
    // } else {
    //     rgbArr = hsv2rgb((360 + angle), sat, .8 )
    // }
    return `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
}




export const getHarmonyObj = (key, angle, pointXY) => {
    const harmonyObj = {
        key: key,
        x: pointXY[0],
        y: pointXY[1],
        angle: angle,
    }

    return harmonyObj

}

export const dummyHarmonyObj = (key, centerXY) => {
    const harm = getHarmonyObj(key, 0, 0, centerXY) 
    return harm;
}


export const getHarmonies = (numHarmonies, angle, dist, centerXY) => {
    const angleOffset = 360/(numHarmonies+1);
    const harmoniesArr = [];

    for (let i = 0; i < numHarmonies; i++) {
        harmoniesArr.push(((angle + (angleOffset * (i+1))) % 360))
    }
    
    let harmoniesObjArr = {}
    harmoniesArr.forEach( (harmony, ix) => {
        harmoniesObjArr[ix] = {
            key: ix,
            x: getCirclePoint(harmony, dist, centerXY)[0],
            y: getCirclePoint(harmony, dist, centerXY)[1],
            angle: harmony
        }
    });
    // console.log(harmoniesObjArr)
    return harmoniesObjArr;


}

export const getComplement = (numHarmonies, angle, dist, centerXY) => {
    if(numHarmonies === 4) {
        return null;
    }
    
    const compAngle = (angle + 180) % 360
    let complement = {
            key: 'complement',
            x: getCirclePoint(compAngle, dist, centerXY)[0],
            y: getCirclePoint(compAngle, dist, centerXY)[1],
            angle: compAngle,
        }

    return complement;

}
