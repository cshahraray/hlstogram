import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { hslToRgb, rgbToHsl } from './util/colorspace_utils';
import { Image, Circle, Layer, Line, Stage } from 'react-konva';
import { Html } from 'react-konva-utils';
import { getShortestLongest } from './util/object-utils';
import { getCirclePoint } from './util/circle_utils';
import { getOneShadeColor } from './util/shade_utils';

import ImageAdjust from './imageAdjust';


function App() {


  //COMPONENT STATE VARIABLES
  const imageRef = useRef(null);
  const outputRef = useRef(null)
  const centerCircleRef = useRef(null);
    //handle image upload and file reading
  const [imageUpload, setImageUpload] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [imageData, setImageData] = useState(null);
    //stores HLS information for visualiaztion
  const [quantizedHLSImageData, setQuantizedImageHLSData] = useState(null);
  const [imageHLSData, setImageHLSData] = useState(null);

    //information about selected hues
    //used JSON to easily add and remove values
    //Array version b/c react can't read changes in JSON as easily
    //(can be refactored using useReducer hook to resolve this isssue as well)
  const [selectedHues, setSelectedHues] = useState({})
  const [selectedHuesArr, setSelectedHuesArr] = useState([]); //
    //store and manipulate image data for the outputed image
  const [imageCanvas, setImageCanvas] = useState(null);

    //misc. values used in visualiaztion and for layout
  const windowWidth = window.innerWidth;
  const windowHeight= window.innerHeight;
  const circleXY = [Math.round(windowWidth/4), Math.round(windowHeight/2)];
  const [diameter, setDiameter] = useState(Math.round(windowHeight/5))
  const plotLength = Math.round(windowHeight/4);
  const maxImgWidth = Math.round(windowWidth/3)
  const maxImgHeight = Math.round(windowHeight/3)
  const [outputHeight, setOutputHeight] = useState(null)
  const [outputWidth, setOutputWidth] = useState(null)




  //given a pixel's RGB values return a JSON with it's HSL values
  const getPixelColor = (pixelR, pixelG, pixelB) => {
    const color = rgbToHsl(pixelR, pixelG, pixelB)

    return {
      h: Math.round(color[0]),
      s: Math.round((color[1] * 100)),
      l: Math.round((color[2] * 100))
    }
  }

  //given a JSON with a pixel's HSL values return a JSON with it's RGB values
  const convertHSL2RGB = (hslObj) => {
    const color = hslToRgb(hslObj.h, hslObj.s / 100, hslObj.l / 100)
    return {
      r: color[0],
      g: color[1],
      b: color[2]
    }
  }

  //EVENT METHODS
  //event method for file upload
  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
    setSelectedHues({}) //reset hue selection upon new file upload
    setSelectedHuesArr([])
  }

  //handles file reading
  //runs asynchronously after file upload as image onload function
  const fetchImageData =  (image) => {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d');
    const origWidth = image.width;
    const origHeight = image.height;
    let outputWidth1, outputHeight1;
    if (origWidth >= origHeight && origWidth > maxImgWidth) {
      outputWidth1 = maxImgWidth
      outputHeight1 = scaleImageDimension(outputWidth1, origWidth, origHeight)
    } else if (origHeight > maxImgHeight ) {
      outputHeight1 = maxImgHeight
      outputWidth1 = scaleImageDimension(outputHeight1, origHeight, origWidth)
    }
    // imageRef.current.width = 500;
    // imageRef.current.height = scaleImageHeight(500, origWidth, origHeight)
    canvas.height = outputHeight
    canvas.width = outputWidth
    // console.log("image width", image.width)
    ctx.drawImage(image, 0,0,outputWidth, outputHeight);
    setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setImageCanvas(canvas)
    
  }

  //event method for hue click, adds or removes hues from list of focus hues
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

    const handleImageClick = (e) => {
      console.log(e)
      console.log(outputRef.current)

    }
  
  //useEffect hooks
  //useEffect hook to set up reading the image pixel data
  useEffect(() => {
      if(imageRef.current && imageUpload) 
      {
        imageRef.current.src=(imageURL);
        imageRef.current.onload=(() => fetchImageData(imageRef.current))
      }
  }, [imageUpload])

  //useEffect hook which fires after image data has been loaded and saved to
  //component state by fetchImageData onload method to analyze the image
  useEffect(() => {
    if (imageData) 
    {  
      setImageHLSData(getImageHLSInfo(imageData))
    }
    }, [imageData])

  useEffect(() => {

    if (imageHLSData) 
    {  
      setQuantizedImageHLSData(pseudoQuantize(imageHLSData))

    }
    }, [imageHLSData])

    //redraw image when user selects hues
    useEffect(() => {
      if (imageRef.current && imageData) {
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


  //method for Canvas to generate custom colored image based on
  //user uploaded image and user's selected focus hues
  //given 
  const adjustImage = (canvas, ctx) => {
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

  //misc method for scaling image heights
  const scaleImageDimension = (new1stDim, orig1stDim, orig2ndDim) => {
    const scale = new1stDim/orig1stDim;
    return Math.round(scale * orig2ndDim)
  }



  


  //DATA VISUALIAZTION related methods
  //given Canvas imageData return a creates a 
  //JSON whose keys are color hues, and values are an array whose length
  // corresponds to the hue's frequency
  const getImageHLSInfo = (imgData) => {
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
  const pseudoQuantize = (imageHSLinfo) => {
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

  //create graph bars around a circle to visualize hue frequency
  //by calculating a polygon's points using radial geometry 
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
    if (!selectedHuesArr.includes(hueAngle.toString()))
    {
      return (
        <Line
          key={hueAngle}
          points={[startpt1[0], startpt1[1], endpt1[0], endpt1[1], endpt2[0], endpt2[1], startpt2[0], startpt2[1]]}
          closed={true}
          fill={getOneShadeColor(hueAngle, 100, 50)} 
          onClick={handleHuesClick.bind(this, hueAngle, selectedHues)}
          
        />
      )
    } else {
      return (
        <Line
          key={hueAngle}
          points={[startpt1[0], startpt1[1], endpt1[0], endpt1[1], endpt2[0], endpt2[1], startpt2[0], startpt2[1]]}
          closed={true}
          fill={getOneShadeColor(hueAngle, 100, 50)} 
          onClick={handleHuesClick.bind(this, hueAngle, selectedHues)}
          stroke={'black'}
        />
      )
    }
  }

  //scale plot length of hues based on the ratio of hue's frequency in the iamge to
  //the frequency of the most frequent hue in the image
  const scaleLength = (num, min, max) => {
    if (num === 0) {
      return 0
    }
    const plotMin = Math.round(plotLength/10)
    
    // const result = (num - min) * (plotLength - plotMin) / (max - min) + plotMin;

    const result = Math.round((num/max) * plotLength)
    return result
    
  }

  //iteratively plot hues based on provided image HLS data
  const plotHues = (imgData) => {
    const [min, max] = getShortestLongest(imgData);
    console.log(max)
    const keys = Object.keys(imgData);
    
    const radius = Math.round(diameter/2)
    return(
       keys.map( key =>
        plotHue(parseInt(key), scaleLength(imgData[key].length, min, max), circleXY, radius)
        )
    )
  }

  const renderImage = () => {
    if (imageCanvas) {

          return (
        <Image
          ref={outputRef}
          width={Math.round(windowWidth / 3)} 
          height={scaleImageDimension(Math.round(windowWidth / 3), imageRef.current.width, imageRef.current.height)} 
          x={circleXY[0] * 2} 
          y={Math.round(circleXY[1]/2)}
          image={imageCanvas}
          onClick={handleImageClick}
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




  //return statement
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
