const createImage = (url) => new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });


// export const useCanvasImage = (imageSrc) => {
    
  
//     return { getImage };
//   };

export const fetchImageData = async (imageSrc) => {
    console.log(imageSrc)
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const safeArea = Math.max(image.width, image.height);

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.drawImage(image, 0, 0);

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    return data;
  };