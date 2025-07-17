export  const mergePropertyImageUrls = (property: { main_image: any; images: any[]; }) => {
  const imageUrls: any[] = [];
  
  // Add main_image first (if it exists)
  // if (property.main_image) {
  //   imageUrls.push(property.main_image);
  // }
  
  // Add all image URLs from the images array
  if (Array.isArray(property.images)) {
    property.images.forEach(img => {
      if (img.image) {
        imageUrls.push(img.image);
      }
    });
  }
  
  return imageUrls;
};