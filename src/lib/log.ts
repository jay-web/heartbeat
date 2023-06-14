import path from "path";
import * as fs from "node:fs/promises";
import { AppError } from "../controllers/error.controller";

class LogLibrary  {

    private baseDir = path.join(__dirname, '/../logs/');

    // ! Open the file (if available or create one) 
    // ! Append the new log data

    public log = async (filename:string, newLogData ) => {
        let filePath = `${this.baseDir}/${filename}.log`;
        let fd: fs.FileHandle | null;

        try {
            fd = await fs.open(filePath, 'a');
            let dataInJSON = JSON.stringify(newLogData);
            await fs.appendFile(fd, dataInJSON +'\n');
           ;
        } catch (error) {
            if(error instanceof Error){
                throw new AppError(500, error.message);
            }
            
        }finally{
            if(fd! !== undefined){
                fd!.close()
            }
        }
    }
}

let logLibrary = new LogLibrary;
export default logLibrary;