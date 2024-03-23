import multer from 'multer';
import db from '../models/index.js';
import path from 'path';
import fs from 'fs';
const dbContext = await db;

var storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './assets/images')
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname+ '-' + Date.now()+'.jpg')
  }
});

const basicUpload = multer({
  storage: storage2
});

const storage = multer.diskStorage({
  destination: async function (req, file, cb)  {
    const userId = req.params.id;
    // var user = await dbContext.User.findByPk(userId);
    // var userName = `${user.lastName || ""} ${user.firstName}`;
    var __dirname = path.resolve(path.dirname(''));
    var userFolderPath = path.join(__dirname, 'assets', 'labeled_images', userId || "dumpFolder");

    if(!fs.existsSync(userFolderPath)) {
      fs.mkdir(userFolderPath, {recursive: true}, () => {});
    } else {
      fs.unlink(userFolderPath, () => {});
    }

    cb(null, userFolderPath);
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.originalname, () => {});
  }
})

const customDirUpload = multer({ storage: storage })

export {
  basicUpload,
  customDirUpload
};
