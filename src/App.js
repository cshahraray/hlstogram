import logo from './logo.svg';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import Button from '@material-ui/core/Button';

function App() {

  const imageRef = useRef(null)
  const [imageUpload, setImageUpload] = useState(null)
  const [imageURL, setImageURL] = useState(null)


  const handleFileChange = (e) => {
    setImageUpload(e.target.files[0])
    setImageURL(URL.createObjectURL(e.target.files[0]))
  }

  useEffect(() => {
    // console.log(imageUpload)
    // console.log(imageURL)
      if(imageRef.current) {
        imageRef.current.src=(imageURL)
      }

 
  }, [imageURL])


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
      onChange={handleFileChange.bind(this)}
    />  
    Upload image
    </Button>

    <img id="image-upload" ref={imageRef} alt="hello" style={{display: "none"}}></img>
    <img id="image-upload" ref={imageRef} alt="hello"></img>

    </div>
  );
}

export default App;
