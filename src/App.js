import { useEffect, useRef, useReducer, useState } from 'react';
import Button from '@material-ui/core/Button';
import { getPixelColor } from './util/colorspace_utils';
import { Image, Circle, Layer, Line, Stage } from 'react-konva';
import { Html } from 'react-konva-utils';
import { getShortestLongest } from './util/object-utils';
import { getCirclePoint } from './util/circle_utils';
import { getOneShadeColor } from './util/shade_utils';
import { adjustImage } from './util/canvas-utils';
import { selectedHuesReducer, HUE_ACTIONS } from './reducers/selectedHues-reducer'
import { getImageHLSInfo, pseudoQuantize } from './util/imagedata-utils';

import ImageAdjust from './imageAdjust';


function App() {


  //COMPONENT STATE VARIABLES
  const imageRef = useRef(null);
  const outputRef = useRef(null)
  const centerCircleRef = useRef(null);
  
  //handle image upload and file reading
  const [imageURL, setImageURL] = useState(null);
  const [imageData, setImageData] = useState(null);
  
  //stores HLS information for visualiaztion
  const [quantizedHLSImageData, setQuantizedImageHLSData] = useState(null);
  const [imageHLSData, setImageHLSData] = useState(null);

  //information about selected hues:
  //used JSON to easily add and remove values
  //useReducer hook so that React can read changes
  // in variable for useEffect hook
  const [selectedHues, huesDispatch] = useReducer(selectedHuesReducer, {})
  
  //store and manipulate canvas object for image display 
  const [origImageCanvas, setOrigImageCanvas] = useState(null);
  const [imageCanvas, setImageCanvas] = useState(null);

    //misc. values used in visualiaztion and for layout
  const windowWidth = window.innerWidth;
  const windowHeight= window.innerHeight;
  const circleXY = [Math.round(windowWidth/6), Math.round(windowHeight/3)];
  const [diameter, setDiameter] = useState(Math.round(windowHeight/8))
  const plotLength = Math.round(windowHeight / 3);
  const maxImgWidth = Math.round(windowWidth * (1/3))
  const maxImgHeight = Math.round(windowHeight * .7)
  const [outputHeight, setOutputHeight] = useState(null)
  const [outputWidth, setOutputWidth] = useState(null)

    //dispatch actions
  const addHue = (hue) => {
    huesDispatch({
      type: HUE_ACTIONS.ADD_HUE,
      hue
    })
  }

  const removeHue = (hue) => {
    huesDispatch({
      type: HUE_ACTIONS.REMOVE_HUE,
      hue
    })
  }

  const resetHues = () => {
    huesDispatch({
      type: HUE_ACTIONS.RESET_HUES
    })
  }
  

  //EVENT METHODS
  //event method for file upload
  const handleFileChange = (e) => {
    setImageURL(URL.createObjectURL(e.target.files[0]))
    resetHues() //reset hue selection upon new file upload
  }


  //handles file reading
  //runs  after file upload (asynch) as image onload function
  const fetchImageData =  () => {
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d');
    const origWidth = imageRef.current.width;
    const origHeight = imageRef.current.height;
    let outputWidth1, outputHeight1;
    if (origWidth >= origHeight && origWidth !== maxImgWidth) {
      outputWidth1 = maxImgWidth
      outputHeight1 = scaleImageDimension(outputWidth1, origWidth, origHeight)
    } else if (origHeight > maxImgHeight ) {
      outputHeight1 = maxImgHeight
      outputWidth1 = scaleImageDimension(outputHeight1, origHeight, origWidth)
    }
    setOutputWidth(outputWidth1)
    setOutputHeight(outputHeight1) 
    canvas.height = outputHeight1
    canvas.width = outputWidth1
    // console.log("image width", image.width)
    ctx.drawImage(imageRef.current, 0,0, outputWidth1, outputHeight1);
    setImageData(ctx.getImageData(0, 0, canvas.width, canvas.height));
    setOrigImageCanvas(canvas)
    setImageCanvas(canvas)
    
  }

  const downloadImg = (uri, name) => {
   let link = document.createElement('a')
   link.download = name;
   link.href = uri;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link)
  }

  //event method for hue click, adds or removes hues from list of focus hues

      const handleHuesClick = (hue) => {
        if (!selectedHues[hue]) {
          addHue(hue)
        } else {
          removeHue(hue)
        }
      }

    
    //event method + helper method to get hue of pixel @ mouse click &
    //add or remove that hue from our selectedHues state variables
    const handleImageClick = (e) => {
      const mousePos = [e.evt.clientX, e.evt.clientY]
      let hue = calculatePixelHue(mousePos)
      while (hue % 5 !== 0){
        hue--;
      }
      handleHuesClick(hue)
    }

    const calculatePixelHue = (mousePos) => {
      let offsetX = Math.round(mousePos[0] - outputRef.current.attrs.x)
      let offsetY = Math.round(mousePos[1] - outputRef.current.attrs.y)
      console.log(offsetX, offsetY)

      let ctx = origImageCanvas.getContext('2d')
      let pixelData = ctx.getImageData(offsetX, offsetY, 1, 1).data
      console.log(pixelData)
      const color = getPixelColor(pixelData[0], pixelData[1], pixelData[2])

      return color.h;

    }
  
  //useEffect hooks
  //useEffect hook to set up reading the image pixel data
  useEffect(() => {
      if(imageURL) 
      {
        imageRef.current = document.createElement('img')
        imageRef.current.src=(imageURL)
        imageRef.current.onload=(() => fetchImageData())
      }
  }, [imageURL])

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
        if (Object.keys(selectedHues).length > 0) {
          adjustImage(canvas, context, Object.keys(selectedHues))
        }
        setImageCanvas(canvas)
        console.log(selectedHues)
      }
  
    }, [selectedHues])


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
  const plotHue = (hueAngle, length, circleCenter, radius, selected) => {
    const endDist = radius + length;

    const startpt1 = getCirclePoint(hueAngle, radius, circleCenter)
    const startpt2 = getCirclePoint(hueAngle+5, radius, circleCenter)
    const endpt1 = getCirclePoint(hueAngle, endDist, circleCenter)
    const endpt2 = getCirclePoint(hueAngle+5, endDist, circleCenter)

    // let selected = Object.keys(selectedHues).includes(hueAngle.toString())

    
      return (
        <Line
          key={hueAngle}
          points={[startpt1[0], startpt1[1], endpt1[0], endpt1[1], endpt2[0], endpt2[1], startpt2[0], startpt2[1]]}
          closed={true}
          fill={selected ? getOneShadeColor(hueAngle, 100, 60) : getOneShadeColor(hueAngle,75,50)} 
          onClick={handleHuesClick.bind(this, hueAngle)}
          bezier={false}
          stroke={getOneShadeColor(((hueAngle+180) % 360), 100, 40)}
          strokeEnabled={selected}
        />
      )
    
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
  //split up render of the unselected and selected hues on the graph
  //so that the stroke of selected hues renders properly
  const plotUnselectedHues = (imgData) => {
    const [min, max] = getShortestLongest(imgData);
    const unselected = Object.keys(imgData).filter(key => !selectedHues.hasOwnProperty(key))
   
    const radius = Math.round(diameter/2)
    return(
      unselected.map( key =>
        plotHue(parseInt(key), scaleLength(imgData[key].length, min, max), circleXY, radius, false)
      )
    )
  }

  const plotSelectedHues = (imgData) => {
    const [min, max] = getShortestLongest(imgData);
    const selected = Object.keys(imgData).filter(key => selectedHues.hasOwnProperty(key))
    const radius = Math.round(diameter/2)
    return(
      selected.map( key =>
        plotHue(parseInt(key), scaleLength(imgData[key].length, min, max), circleXY, radius, true)
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
          x={circleXY[0] + diameter/2 + (plotLength)} 
          y={Math.round(windowHeight / 5)}
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

  //misc. elements

  //render buttons for to reset hue selection and image download link

  const renderButtons= () => {
    return ( 
    <>
    <Button 
      type = {"contained"}
      onClick = {() => {
        resetHues()
      }}
      >
        Reset Hue Selection
      </Button>
      <Button 
      type = {"contained"}
      onClick = {() => {
        const url = imageCanvas.toDataURL('image/jpeg', 1.0)
        downloadImg(url, 'hlstogram-output.jpeg')
      }}
      >
        Download Your Image
      </Button>
      </>
      )

  }




  //return statement
  return (
    // <div className="App">
    <>
    <Stage
      width = {windowWidth}
      height = {windowHeight}
      >

      <Layer>
      

        <Html>
          <Button
            component = "label"
            type={"contained"}>
          <input
            type="file"
            accept="image/*"
            id="input"
            hidden
            onChange={handleFileChange}
          />  
          Upload image
          </Button>

          {(imageData && Object.keys(selectedHues).length > 0)
           && renderButtons()
          }
    
    

    {/* </div> */}
    </Html>
    
      {/* draw and call the bars seperately so stroke shows up properly */}
      {quantizedHLSImageData &&  plotUnselectedHues(quantizedHLSImageData)}
      {quantizedHLSImageData &&  plotSelectedHues(quantizedHLSImageData)}

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
