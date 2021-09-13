import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { createImage } from './util/canvas-utils';
import { hslToRgb, rgbToHsl } from './util/colorspace_utils';
const getPixels = require('get-pixels')

function App() {

  const imageRef = useRef(null)
  const [imageUpload, setImageUpload] = useState(null)
  const [imageURL, setImageURL] = useState(null)


  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
  }
  

  // const getImageData = () => {

  // }

  useEffect(() => {
    // console.log(imageUpload)
    // console.log(imageURL)
    const createImage = (url) => new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', error => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

      if(imageRef.current && imageUpload) {
        imageRef.current.addEventListener('load', () => fetchImageData(imageRef.current) )
        imageRef.current.src=(imageURL)
        // imageRef.current.onload=(() => fetchImageData(imageRef.current))
        
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

  const fetchImageData =  (image) => {
    var canvas = document.getElementById('canvas')
    var ctx = canvas.getContext('2d');
    canvas.width = image.width
    canvas.height = image.height
    // console.log("image width", image.width)
    ctx.drawImage(image, 0,0);
    let canvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    console.log(getImageHSLInfo(canvasImageData))
  }

  const getImageHSLInfo = (imageData) => {
    const data = imageData.data;
    let hues = { }
    for (let i=0; i < data.length; i += 4) {
      //data[i] = pixel red component
      //[i+1] = blue component
      //[i+2] = green
      //[i+3] = alpha channel
      let color = getPixelColor(data[i], data[i+1], data[i+2])
      hues[color.h] = hues[color.h] || []
      hues[color.h].push([color.s, color.l])
    }
    return hues;
  }

  const getDominantHues = (imageHSLinfo) => {
    
  }

  const getPixelColor = (pixelR, pixelB, pixelG) => {
    const color = rgbToHsl(pixelR, pixelB, pixelG)

    return {
      h: color[0],
      s: Math.round((color[1] * 100)),
      l: Math.round((color[2] * 100))
    }
  }



  return (
    <div className="App">
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

    <img id="image-upload" ref={imageRef} alt="hello" style={{display: "none"}}></img>
    {/* <img id="image-upload" ref={imageRef} alt="hello"></img> */}
    <canvas id="canvas" style={{display:"none"}} ></canvas>

    </div>
  );
}

export default App;
