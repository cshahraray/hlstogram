import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { createImage } from './util/canvas-utils';
import { hslToRgb, rgbToHsl } from './util/colorspace_utils';
import { Arc, Circle, Layer, Line, Stage } from 'react-konva';
import { Html } from 'react-konva-utils';
import { getShortestLongest } from './util/object-utils';
import { deg2Rad, getCirclePoint } from './util/circle_utils';
import { getOneShadeColor } from './util/shade_utils';
// const getPixels = require('get-pixels')

function App() {
  const windowWidth = window.innerWidth;
  const windowHeight= window.innerHeight;
  const circleXY = [Math.round(windowWidth/2), Math.round(windowHeight/2)]

  const imageRef = useRef(null)
  const centerCircleRef = useRef(null)
  const [imageUpload, setImageUpload] = useState(null)
  const [imageURL, setImageURL] = useState(null)
  const [imageData, setImageData] = useState(null)
  const [quantizedImageData, setQuantizedImageData] = useState(null)
  // const [quantizedInfo, setQuantizeInfo] = useState(null)
  const [diameter, setDiameter] = useState(Math.round(windowHeight/10))
  const plotLength = Math.round(windowHeight/2);




  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
  }

  useEffect(() => {
      if(imageRef.current && imageUpload) {
        imageRef.current.src=(imageURL);
        imageRef.current.onload=(() => fetchImageData(imageRef.current))
      }
  }, [imageUpload])

  useEffect(() => {
    if (imageData)
      setQuantizedImageData(pseudoQuantize(imageData))
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

  const getImageHSLInfo = (imgData) => {
    const data = imgData.data;
    let hues = { }
    for (let i=0; i < data.length; i += 4) { //+4 = every pixel -> +8 = every other pixel
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
    console.log(hues)
    return hues;
  }

  const pseudoQuantize = (imageHSLinfo) => { // combine adjacent hues
    let quantized = {};
    // let keys = Object.values(imageHSLinfo)

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

  const plotHue = (hueAngle, length, circleCenter, radius) => {
    // console.log(length)

    const endDist = radius + length;
    // console.log('hue Angle', hueAngle)
    // console.log('radius', radius)
    // console.log('circle center', circleCenter)
    // console.log('length', length)
    const startpt1 = getCirclePoint(hueAngle, radius, circleCenter)
    const startpt2 = getCirclePoint(hueAngle+4, radius, circleCenter)
    const endpt1 = getCirclePoint(hueAngle, endDist, circleCenter)
    const endpt2 = getCirclePoint(hueAngle+4, endDist, circleCenter)
    // console.log(startpt1, startpt2, endpt1, endpt2)
    // return [startpt1[0], startpt1[1], endpt1[0], endpt1[1], endpt2[0], endpt2[1], startpt2[0], startpt2[1]]
      return (
        <Line
          key={hueAngle}
          points={[startpt1[0], startpt1[1], endpt1[0], endpt1[1], endpt2[0], endpt2[1], startpt2[0], startpt2[1]]}
          closed={true}
          fill={getOneShadeColor(hueAngle, 100, 50)} 
        />
      )
  }

  const scaleLength = (num, max) => {
    return Math.round((num/max) * plotLength)
  }

  const plotHues = (imgData) => {
    const max = getShortestLongest(imgData)[1];
  
    const keys = Object.keys(imgData);
    
    const radius = Math.round(diameter/2)
    // console.log('max', max)
    // console.log('keys', keys)
    // console.log(imgData)
    // console.log(scaleLength(imgData[keys[1]].length))
    // console.log(scaleLength(imgData[keys[1]]))
    // const result = []
    return(
       keys.map( key =>
        plotHue(parseInt(key), scaleLength(imgData[key].length, max), circleXY, radius)
        )
    )
    // keys.map( key => console.log(scaleLength(imageData[key].length, max)))


  }





  return (
    // <div className="App">
    <>
    <Stage
      width = {windowWidth}
      height = {windowHeight}>

      <Layer>
        <Html>
          <Button
            component = "label"
            type= "contained">
          <input
            type="file"
            accept="image/*"
            id="input"
            hidden
            onChange={handleFileChange.bind(this)}
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
     
      {/* {plotHue(9, 64, circleXY, diameter/2)} */}
      {/* {plotHue(59, 122, circleXY, diameter/2)} */}

      {/* {plotHue(120, 88, circleXY, diameter/2)} */}
      {/* {plotHue(270, (plotLength/2), circleXY, diameter/2)} */}
      {quantizedImageData &&  plotHues(quantizedImageData)}
      <Circle key={'centerCircle'}
        ref={centerCircleRef}
        x={circleXY[0]}
        y={circleXY[1]}
        width={diameter}
        height={diameter}
        stroke={'black'}
      />
    </Layer>


    </Stage>
    </>
  );
}

export default App;
