import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { convertHSL2RGB, getPixelColor, hslToRgb, rgbToHsl } from './util/colorspace_utils';
import { Image, Circle, Layer, Line, Stage } from 'react-konva';
import { Html } from 'react-konva-utils';
import { getShortestLongest } from './util/object-utils';
import { getCirclePoint } from './util/circle_utils';
import { getOneShadeColor } from './util/shade_utils';

import ImageAdjust from './imageAdjust';
import { adjustImage } from './util/canvas-utils';
import { getImageHLSInfo, pseudoQuantize } from './util/imagedata-utils';


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
  const maxImgHeight = Math.round(windowHeight/2)
  const [outputHeight, setOutputHeight] = useState(null)
  const [outputWidth, setOutputWidth] = useState(null)

  //EVENT METHODS
  //event method for file upload
  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
    setSelectedHues({}) //reset hue selection upon new file upload
    setSelectedHuesArr([])
  }


  const resizeImg = () => {
  }
  //handles file reading
  //runs asynchronously after file upload as image onload function
  const fetchImageData =  () => {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d');
    const origWidth = imageRef.current.width;
    const origHeight = imageRef.current.height;
    let outputWidth1, outputHeight1;
    if (origWidth >= origHeight && origWidth > maxImgWidth) {
      outputWidth1 = maxImgWidth
      outputHeight1 = scaleImageDimension(outputWidth1, origWidth, origHeight)
      setOutputWidth(outputWidth1)
      setOutputHeight(outputHeight1)
    } else if (origHeight > maxImgHeight ) {
      outputHeight1 = maxImgHeight
      outputWidth1 = scaleImageDimension(outputHeight1, origHeight, origWidth)
    } else {
      outputHeight1 = origHeight;
      outputWidth1 = origWidth;
    }
    setOutputWidth(outputWidth1)
    setOutputHeight(outputHeight1) 
    console.log("height ", outputHeight1)
    console.log("width ", outputWidth1)
    // imageRef.current.height = scaleImageHeight(500, origWidth, origHeight)
    canvas.height = outputHeight1
    canvas.width = outputWidth1
    // console.log("image width", image.width)
    ctx.drawImage(imageRef.current, 0,0, outputWidth1, outputHeight1);
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
      // console.log(e)
      // console.log(outputRef.current)

    }
  
  //useEffect hooks
  //useEffect hook to set up reading the image pixel data
  useEffect(() => {
      if(imageUpload) 
      {
        imageRef.current = document.createElement('img')
        imageRef.current.src=(imageURL)
        imageRef.current.onload=(() => fetchImageData())
      }
  }, [imageUpload, imageURL])

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
        canvas.height = outputHeight
        canvas.width = outputWidth
        context.putImageData(imageData, 0, 0)
        if (selectedHuesArr.length > 0) {
          adjustImage(canvas, context, selectedHuesArr)
        }
        setImageCanvas(canvas)
      }
  
    }, [selectedHuesArr])


  //misc method for scaling image heights
  const scaleImageDimension = (new1stDim, orig1stDim, orig2ndDim) => {
    const scale = new1stDim/orig1stDim;
    return Math.round(scale * orig2ndDim)
  }






  //DATA VISUALIAZTION related methods
  //imagedata-utils for more info
  //given Canvas imageData return a creates a 
  //JSON whose keys are color hues, and values are an array whose length
  // corresponds to the hue's frequency

  

  //create graph bars around a circle to visualize hue frequency
  //by calculating a polygon's points using radial geometry 
  const plotHue = (hueAngle, length, circleCenter, radius) => {
    const endDist = radius + length;

    const startpt1 = getCirclePoint(hueAngle, radius, circleCenter)
    const startpt2 = getCirclePoint(hueAngle+4, radius, circleCenter)
    const endpt1 = getCirclePoint(hueAngle, endDist, circleCenter)
    const endpt2 = getCirclePoint(hueAngle+4, endDist, circleCenter)

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
    if (imageRef.current && imageCanvas) {

          return (
        <Image
          ref={outputRef}
          width={imageCanvas.width} 
          height={imageCanvas.height} 
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
   
    </>
    
  );
}

export default App;
