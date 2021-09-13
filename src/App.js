import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';
import { createImage } from './util/canvas-utils';
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
    console.log(ctx.getImageData(0, 0, canvas.width, canvas.height))
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
