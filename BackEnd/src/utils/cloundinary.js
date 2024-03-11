import 'dotenv/config';
import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
})

const uploadImage = async(url) => {
    try {
        var result = await cloudinary.uploader.upload(url);
        if(result.url) {
            return result.url;
        } else return "";
    }
    catch(error) {
        console.log(error);
    }
}

export {
    uploadImage
}
