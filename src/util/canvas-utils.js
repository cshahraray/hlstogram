//method for Canvas to generate custom colored image based on
  //user uploaded image and user's selected focus hues

import { convertHSL2RGB, getPixelColor } from "./colorspace_utils";

export const adjustImage = (canvas, ctx, selectedHuesArr) => {
    let img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let data = img.data;
    let color;
    let newColor;
    if (selectedHuesArr.length > 0 ){
      for (let i=0; i < data.length; i += 4) {
        //data[i] = pixel red component
        //[i+1] = green component
        //[i+2] = blue
        //[i+3] = alpha channel
        color = getPixelColor(data[i], data[i+1], data[i+2])
          if (!selectedHuesArr.includes(color.h.toString())) {
            color.s = 0
            newColor = convertHSL2RGB(color)
            data[i] = newColor.r
            data[i+1] = newColor.g
            data[i+2] = newColor.b
          }
      }

      ctx.putImageData(img, 0, 0)
    }
  }