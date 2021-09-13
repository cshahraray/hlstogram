import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { createImage } from './util/canvas-utils';
import { hslToRgb, rgbToHsl } from './util/colorspace_utils';
import { Arc, Circle, Layer, Line, Stage } from 'react-konva';
import { Html } from 'react-konva-utils';
// const getPixels = require('get-pixels')

function App() {
  const windowWidth = window.innerWidth;
  const windowHeight= window.innerHeight;
  const circleXY = [Math.round(windowWidth/2), Math.round(windowHeight/2)]

  const imageRef = useRef(null)
  const [imageUpload, setImageUpload] = useState(null)
  const [imageURL, setImageURL] = useState(null)
  const [imageData, setImageData] = useState(null)
  // const [imageHSLInfo, setImageHSLInfo] = useState(null)
  // const [quantizedInfo, setQuantizeInfo] = useState(null)



  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
  }
  

  // const getImageData = () => {

  // }

  useEffect(() => {
    // console.log(imageUpload)
    // console.log(imageURL)
    // const createImage = (url) => new Promise((resolve, reject) => {
    //   const image = new Image();
    //   image.addEventListener('load', () => resolve(image));
    //   image.addEventListener('error', error => reject(error));
    //   image.setAttribute('crossOrigin', 'anonymous');
    //   image.src = url;
    // });

      if(imageRef.current && imageUpload) {
        // imageRef.current.addEventListener('load', () => setImageData(fetchImageData(imageRef.current)))
        imageRef.current.src=(imageURL);

        imageRef.current.onload=(() => fetchImageData(imageRef.current))
        
        // getPixels(imageRef.current.src, (err, pixels) => {
        //   if (!err) {console.log(pixels)} else {console.log(err)}
        // } )
      }
      // const canvas = (document.createElement('canvas'))
      // const context = canvas.getContext('2d')
      // context.drawImage(imageRef.current, 0, 0)
      // console.log(context)
 
  }, [imageUpload])

  // useEffect(() => {
  //   // console.log(fetchImageData(imageURL))
  //   if (imageRef.current) {
  //     console.log(fetchImageData(imageRef.current.src))
  //   }
  // }, [imageURL])
  useEffect(() => {

  }, [imageData])

  const fetchImageData =  (image) => {
    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d');
    canvas.width = image.width
    canvas.height = image.height
    // console.log("image width", image.width)
    ctx.drawImage(image, 0,0);
    let canvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setImageData(getImageHSLInfo(canvasImageData));
  }

  const getImageHSLInfo = (imageData) => {
    const data = imageData.data;
    let hues = { }
    for (let i=0; i < data.length; i += 8) { //+4 = every pixel -> +8 = every other pixel
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

  // const pseudoQuantize = (imageHSLinfo) => { // combine adjacent hues
  //   let quantized = {};

  //   return Object.keys(imageHSLinfo).length;
      
  //   }

  

  // const getDominantHues = (imageHSLinfo) => {

  // }

  const getPixelColor = (pixelR, pixelB, pixelG) => {
    const color = rgbToHsl(pixelR, pixelB, pixelG)

    return {
      h: Math.round(color[0]),
      s: Math.round((color[1] * 100)),
      l: Math.round((color[2] * 100))
    }
  }



  return (
    // <div className="App">
    <>
    <Stage
      width = {windowWidth}
      height = {windowHeight}>

      <Layer listening={false}>
        <Html>
          <Button
            component = "label"
            type= "contained">
          <input
            type="file"
            accept="image/*"
            id="input"
            hidden
            onChange={handleFileChange}
          />  
          Upload image
          </Button>
    <div style={{display: "none"}}>
      <img id="image-upload" ref={imageRef} alt="hello"></img>
    {/* <img id="image-upload" ref={imageRef} alt="hello"></img> */}
    <canvas id="canvas"  ></canvas>
    </div>
    {/* </div> */}
    </Html>
    {/* <Circle */}
    </Layer>


    </Stage>
    </>
  );
}

export default App;
