import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { resolve } from 'path';

class Resize {
  constructor(folder) {
    this.folder = folder;
  }
  async save(buffer) {
    const filename = Resize.filename();
    const filepath = this.filepath(filename);

    await sharp(buffer)
      .resize(300, 300, { // size image 300x300
        // fit: _fit.inside,
        withoutEnlargement: true
      })
      .toFile(filepath);
    
    return filename;
  }
  static filename() {
     // random file name
    return `${uuidv4()}.png`;
  }
  filepath(filename) {
    return resolve(`${this.folder}/${filename}`)
  }
}

export default Resize;
