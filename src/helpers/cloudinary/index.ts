import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadOnCloudinary = async (localFilePath : string) => {
      try {
          if (!localFilePath) return null
          const response = await cloudinary.uploader.upload(localFilePath, {
              resource_type: "auto"
          })
          return response;
  
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
          return null;
      }
  }
  
  
  
