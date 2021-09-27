import { Image } from "konva/lib/shapes/Image";
import { useEffect, useState } from "react";
import { hslToRgb, rgbToHsl } from "./util/colorspace_utils";

const ImageAdjust = (props) => {
    const [imageCanvas, setImageCanvas] = useState(null)
    const huesArray = props.huesArray

    useEffect(() => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = props.height
        canvas.width = props.width
        context.putImageData(props.imageData, 0, 0)
        setImageCanvas(canvas)
    }, [])

    // const drawImage = (context) => {
    //     let image = context.createImageData(props.width, props.height);
    //     let data = image.data;
    //     let origImgdata = props.origImgdata;
    //     console.log("drawing image")
    //     if (huesArray.length !== 0 ){
    //         for (let i=0; i < data.length; i += 4) {
    //           //data[i] = pixel red component
    //           //[i+1] = green component
    //           //[i+2] = blue
    //           //[i+3] = alpha channel
    //           let color = getPixelColor(origImgdata[i], origImgdata[i+1], origImgdata[i+2])
    //           console.log(huesArray.includes(color.h))
    //             if (huesArray.includes(color.h)) {
    //               data[i] = origImgdata[i]
    //               data[i+1] = origImgdata[i+1]
    //               data[i+2] = origImgdata[i+2]
    //               data[i+3] = origImgdata[i+3]
    //             } else {
    //               color.s = 0
    //               let newColor = convertHSL2RGB(color)
    //               data[i] = newColor.r
    //               data[i+1] = newColor.g
    //               data[i+2] = newColor.b
    //               data[i+3] = origImgdata[i+3]
      
    //             }
    //         }

    //         context.putImageData(image, 0, 0)
    //     } else {
    //         context.putImageData(origImgdata, 0, 0)
    //     }
    // }

    const getPixelColor = (pixelR, pixelB, pixelG) => {
        const color = rgbToHsl(pixelR, pixelB, pixelG)
    
        return {
          h: Math.round(color[0]),
          s: Math.round((color[1] * 100)),
          l: Math.round((color[2] * 100))
        }
      }
    
      const convertHSL2RGB = (hslObj) => {
        const color = hslToRgb(hslObj.h, hslObj.s / 100, hslObj.l / 100)
        return {
          r: color[0],
          g: color[1],
          b: color[2]
        }
      }

    return (
            <Image 
          width={props.imgWidth} 
          height={props.imgHeight} 
          x={props.x} 
          y={props.y}
          // offsetX={400}
          // offsetY={imageRef.current.height}
          image={imageCanvas}
          />

    )

}

export default ImageAdjust