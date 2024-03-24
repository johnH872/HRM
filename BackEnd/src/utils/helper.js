import path from 'path';
import fs from 'fs'
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs-node';
import * as canvas from 'canvas';

const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
class Helper {
    constructor() { };

    // checkPermission(roleId, permissionName) {
    //     return new Promise(
    //         (resolve, reject) => {
    //             Permission.findOne({
    //                 where: {
    //                     permission: permissionName
    //                 }
    //             }).then((permission) => {
    //                 Role_Permission.findOne({
    //                     where: {
    //                         roleId: roleId,
    //                         permissionId: permission.permissionId
    //                     }
    //                 }).then((rolePermission) => {
    //                     if(rolePermission) {
    //                         resolve(rolePermission);
    //                     } else {
    //                         reject({message: "Forbidden ne"})
    //                     }
    //                 }).catch((error) => reject(error));
    //             }).catch((error) => reject(error));
    //         }
    //     );
    // }

}

const addFaceToModel = async (userId) => {
    try {
        var newFaceMatcher = null;
        const __dirname = path.resolve(path.dirname(''));
        const userFolderPath = path.join(__dirname, 'assets', 'labeled_images', userId);
        const faceMatcherFolder = path.join(__dirname, 'assets', 'traning_model', 'faceMatcher.json');
        // get current user training images
        if (!fs.existsSync(userFolderPath)) return result;
    
        const files = fs.readdirSync(userFolderPath);
        const isFaceMatcherModel = !fs.existsSync(faceMatcherFolder);
        // get current face matcher model
        const detectionResult = await getLabeledFaceDescriptors(files, userId, __dirname);
        if(!detectionResult) return;
        if (!isFaceMatcherModel) {
            const JSONparseFaceMatcher = JSON.parse(fs.readFileSync(faceMatcherFolder).toString());
            const FaceMatcherFromJSON = faceapi.FaceMatcher.fromJSON(JSONparseFaceMatcher);
            // Array<faceapi.LabeledFaceDescriptors> labeledDescriptors;
            let labeledDescriptors = FaceMatcherFromJSON.labeledDescriptors;
    
            const index = labeledDescriptors.findIndex(item => item.label === userId);
            if (index != -1) {
                labeledDescriptors.splice(index, 1);
            }
            labeledDescriptors = labeledDescriptors.concat(detectionResult);
            newFaceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);
        } else newFaceMatcher = new faceapi.FaceMatcher(detectionResult, 0.7);
            

        if(newFaceMatcher) {
            const modelJSON = newFaceMatcher.toJSON();
            fs.writeFileSync(faceMatcherFolder, JSON.stringify((modelJSON)));
        }
        return true;
    } catch(error) {
        console.error(error);
        return false;
    }
}

const getLabeledFaceDescriptors = async (files, userId, __dirname) => {
    // Init model
    await Promise.all([faceapi.nets.tinyFaceDetector.loadFromDisk('./assets/models'),
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./assets/models'),
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./assets/models'),
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('./assets/models'),
    await faceapi.nets.faceExpressionNet.loadFromDisk('./assets/models'),]);

    const labels = [userId]
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            for (var file of files) {
                var image = await canvas.loadImage(`./assets/labeled_images/${label}/${file}`);
                const detection = await faceapi.detectSingleFace(image, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.75, maxResults: 1 }))
                            .withFaceLandmarks(false)
                            .withFaceDescriptor()
                            .withFaceExpressions();
                if(detection) descriptions.push(detection.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

export {
    addFaceToModel
}