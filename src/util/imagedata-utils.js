//given Canvas imageData return a creates a 
//JSON whose keys are color hues, and values are an array whose length
// corresponds to the hue's frequency

import { getPixelColor } from "./colorspace_utils";

export const getImageHLSInfo = (imgData) => {
    const data = imgData.data;
    let hues = { }
    for (let i=0; i < data.length; i += 4) { //+4 = every pixel 
      //data[i] = pixel red component
      //[i+1] = blue component
      //[i+2] = green
      //[i+3] = alpha channel
      let color = getPixelColor(data[i], data[i+1], data[i+2])
      hues[color.h] = hues[color.h] || []

      if (color.s > 5 && (color.l > 5 && color.l < 95)) {  //don't count grey, white or black.
       hues[color.h].push([color.s, color.l])
      }
    }
    return hues;
  }

  //'Quantize' the HLS image by grouping information about adjacent hues
  //so that our visualiaztion isn't crowded 

export const pseudoQuantize = (imageHSLinfo) => {
    let quantized = {};

    for (let i = 0; i < 360; i += 5) {
      quantized[i] = []
      if (imageHSLinfo[i]) {
        quantized[i] = quantized[i].concat(imageHSLinfo[i])
      }
      for (let j = 1; j < 5; j++) {
        if (imageHSLinfo[i+j]) {
          quantized[i] = quantized[i].concat(imageHSLinfo[i+j])
        }
      }
      
    }
    return quantized;
      
}