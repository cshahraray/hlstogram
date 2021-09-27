import logo from './logo.svg';
import './App.css';
import { cloneElement, useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { createImage } from './util/canvas-utils';
import { hslToRgb, rgbToHsl } from './util/colorspace_utils';
import { Image, Arc, Circle, Layer, Line, Stage } from 'react-konva';
import { Html } from 'react-konva-utils';
import { getShortestLongest } from './util/object-utils';
import { deg2Rad, getCirclePoint } from './util/circle_utils';
import { getOneShadeColor } from './util/shade_utils';

import ImageAdjust from './imageAdjust';
import clone from 'just-clone';
// const getPixels = require('get-pixels')

function App() {
  const windowWidth = window.innerWidth;
  const windowHeight= window.innerHeight;
  const circleXY = [Math.round(windowWidth/4), Math.round(windowHeight/2)];

  const imageRef = useRef(null);
  const centerCircleRef = useRef(null);
  const [imageUpload, setImageUpload] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [quantizedHLSImageData, setQuantizedImageHLSData] = useState(null);
  const [imageHLSData, setImageHLSData] = useState(null);
  const [selectedHues, setSelectedHues] = useState({})
  
  const [selectedHuesArr, setSelectedHuesArr] = useState([]);
  const [outputImage, setOutputImage] = useState(null);
  const [imageCanvas, setImageCanvas] = useState(null);

  // const [quantizedInfo, setQuantizeInfo] = useState(null)
  const [diameter, setDiameter] = useState(Math.round(windowHeight/10))
  const plotLength = Math.round(windowHeight/4);


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

  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
    setSelectedHues({})
    setSelectedHuesArr([])
  }


  const handleHuesClick = (hueAngle, hues) => {

      if (!hues[hueAngle]) {
        hues[hueAngle] = true
        hues[hueAngle+1] = true
        hues[hueAngle+2] = true
        hues[hueAngle+3] = true
        hues[hueAngle+4] = true

      } else {
        delete hues[hueAngle] 
        delete hues[hueAngle+1]
        delete hues[hueAngle+2]
        delete hues[hueAngle+3]
        delete hues[hueAngle+4]
      }
      setSelectedHues(hues)
      setSelectedHuesArr(Object.keys(selectedHues))
      // console.log(selectedHues)
    }
  

  useEffect(() => {
      if(imageRef.current && imageUpload) 
      {
        imageRef.current.src=(imageURL);
        imageRef.current.onload=(() => fetchImageData(imageRef.current))
      }
  }, [imageUpload])

  useEffect(() => {
    if (imageData) 
    {  
      setImageHLSData(getImageHLSInfo(imageData))
      setOutputImage(imageData)
    }
    }, [imageData])

  useEffect(() => {

    if (imageHLSData) 
    {  
      setQuantizedImageHLSData(pseudoQuantize(imageHLSData))

    }
    }, [imageHLSData])

  const fetchImageData =  (image) => {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d');
    const origWidth = image.width;
    const origHeight = image.height;
    // imageRef.current.width = 500;
    // imageRef.current.height = scaleImageHeight(500, origWidth, origHeight)
    canvas.height = image.height 
    canvas.width = image.width
    // console.log("image width", image.width)
    ctx.drawImage(image, 0,0);
    setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setImageCanvas(canvas)
    
  }

  // useEffect(() => {

  //   const selectedHuesArr = Object.keys(selectedHues)
  //   if (selectedHuesArr.length > 0)
  //     {
  //     const imageCanvas = document.createElement('canvas')
  //     imageCanvas.width = imageRef.current.width
  //     imageCanvas.height = imageRef.current.height
  //     // const origImgCtx = originalImage.getContext('2d')
  //     const imgCanvasCtx = imageCanvas.getContext('2d')

      
  //     adjustImage(imgCanvasCtx, imageData, imageCanvas.width, imageCanvas.height, selectedHuesArr)
  //     setOutputImage(imageCanvas)
  //   }
  //   // if (selectedHues) {
  //   //   setSelectedHuesArr(Object.keys(selectedHues))
  //   //   console.log(selectedHuesArr)

  //   // }

  // }, [selectedHues])

  const adjustImage = (canvas, ctx) => {
    // const origData = imageData.data;

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
        // console.log(!huesArray.includes(color.h))
        let set = new Set(selectedHuesArr)
        // if (i < 16) {
        //   console.log(typeof selectedHuesArr[0])
        //     console.log(typeof color.h.toString())
        //   console.log(set.has(color.h.toString()))
        //   console.log(selectedHuesArr.includes(color.h.toString()))
        // }
          if (!selectedHuesArr.includes(color.h.toString())) {
            // console.log(color.h)
            color.s = 0
            newColor = convertHSL2RGB(color)
            data[i] = newColor.r
            data[i+1] = newColor.g
            data[i+2] = newColor.b
            data[i+3] = 254;
          }
      }
      // console.log(data === imageData.data)

      ctx.putImageData(img, 0, 0)
    }


  }

  const scaleImageHeight = (newWidth, origWidth, origHeight) => {
    const scale = newWidth/origWidth;
    return Math.round(scale * origHeight)
  }

  useEffect(() => {
    if (imageRef.current && imageData) {
      // console.log(imageRef.current)
      // console.log(imageData)
     
      console.log(selectedHuesArr)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.height = imageRef.current.height
      canvas.width = imageRef.current.width
      context.putImageData(imageData, 0, 0)
      if (selectedHuesArr.length > 0) {
        adjustImage(canvas, context)
      }
      setImageCanvas(canvas)
    }

  }, [selectedHuesArr])

  const renderImage = () => {
    if (imageCanvas) {
      // console.log(imageRef.current)
      // console.log(imageData)
      // const canvas = document.createElement('canvas')
      // const context = canvas.getContext('2d')
      // canvas.height = imageRef.current.height
      // canvas.width = imageRef.current.width
      // context.putImageData(imageData, 0, 0)
      //   if (Object.keys(selectedHues).length > 0)
      //   {
      //     adjustImage(context, canvas.width, canvas.height, Object.keys(selectedHues))
      //   }
      // setImageCanvas(canvas)
      // const imgWidth = Math.round(windowWidth / 2);
      // const imgHeight = scaleImageHeight(imgWidth, imageRef.current.width, imageRef.current.height)

          return (
        <Image
          width={Math.round(windowWidth / 2)} 
          height={scaleImageHeight(Math.round(windowWidth / 2), imageRef.current.width, imageRef.current.height)} 
          x={circleXY[0] * 2} 
          y={Math.round(circleXY[1]/2)}
          image={imageCanvas}
          />
      )

      // return (  
      // <ImageAdjust 
      //   huesArray = {Object.keys(selectedHues)}
      //   width = {imageRef.current.width}
      //   height = {imageRef.current.height}
      //   origImgdata = {imageData}
      //   xPos = {800}
      //   yPos={400}
      // />)
    }
  }

  const getImageHLSInfo = (imgData) => {
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
          onClick={handleHuesClick.bind(this, hueAngle, selectedHues)}
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
            onChange={handleFileChange}
          />  
          Upload image
          </Button>
    
    

    {/* </div> */}
    </Html>
    
      {/* {plotHue(9, 64, circleXY, diameter/2)} */}
      {/* {plotHue(59, 122, circleXY, diameter/2)} */}

      {/* {plotHue(120, 88, circleXY, diameter/2)} */}
      {/* {plotHue(270, (plotLength/2), circleXY, diameter/2)} */}
      {quantizedHLSImageData &&  plotHues(quantizedHLSImageData)}
      <Circle key={'centerCircle'}
        ref={centerCircleRef}
        x={circleXY[0]}
        y={circleXY[1]}
        width={diameter}
        height={diameter}
        stroke={'black'}
      />

      {/* {imageData &&  <ImageAdjust
          width={Math.round(windowWidth / 2)} 
          height={scaleImageHeight(Math.round(windowWidth / 2), imageRef.current.width, imageRef.current.height)} 
          x={circleXY[0] * 2} 
          y={Math.round(circleXY[1]/2)}
          imageData={imageData}
          />} */}
    {imageData && renderImage()}

    
    </Layer>


    </Stage>
    <div style={{display: "none"}}>
      <img id="image-upload" ref={imageRef} alt="hello"></img>
      <canvas id="canvas"></canvas>
    {/* <img id="image-upload" ref={imageRef} alt="hello"></img> */}
    </div>
    </>
    
  );
}

export default App;
