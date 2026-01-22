import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url); //percorso completo del file corrente 
const __dirname = dirname(__filename); //directory del file corrente 


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); //callback di multer 
  },
  filename: function (req, file, cb) { //definisce come nominare il file quando viene salvato  
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9); //genera stringa univoca
    const ext = path.extname(file.originalname); //prende estensione del file originale 
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);  //compone il nuovo nome del file 
  },
});


export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => { //qui si dice quali tipi di file sono accettati 
    const allowedTypes = /jpeg|jpg|png/; //regex che permette solo i file specificati 
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) { //verifica se l'estensione è consentita 
      cb(null, true);
    } else {
      cb(new Error("Only JPEG and PNG images are allowed."));
    }
  },
});  