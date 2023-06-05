import * as fs from 'node:fs/promises';
import path from 'path';
import { AppError } from '../controllers/error.controller';

class DataLibrary {

    private baseDir = path.join(__dirname, '/../database/');

    // ! Create the file and write the data
    public async create(dir, filename, data){
        
        let filePath = `${this.baseDir}${dir}/${filename}.json`;
        let fd: fs.FileHandle | null;

        // ! Open the file for writing and write the data
        try {
            fd = await fs.open(filePath, 'wx');
            let stringData = JSON.stringify(data);
           await fs.writeFile(fd, stringData);
    
        } catch (error) {
            throw new AppError(400, `${filename} in ${dir} is already exist`);            
        } finally {
            if(fd! !== undefined){
                fd!.close()
            }
            
        }
    }

    // ! Read the data from the file
    public async read(dir:string, filename:string){
        let filePath = `${this.baseDir}${dir}/${filename}.json`;
        try {
            let data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
           
            throw new AppError(404, `${filename} in ${dir} is not found`);  
        }

    }

    // ! Update the data of the file which already exist
    public async update(dir:string, filename:string, data:any){
        let filePath = `${this.baseDir}${dir}/${filename}.json`;
        let fd: fs.FileHandle | null;

        try {
            fd = await fs.open(filePath, 'r+');
            let stringData = JSON.stringify(data);
            await fs.truncate(filePath);
            await fs.writeFile(fd, stringData);
        } catch (error) {
            if(error instanceof Error){
                throw new AppError(500, error.message);
            }
            
        } finally{
            if(fd! !== null){
                fd!.close()
            }
        }

    }

    // ! Delete the data from the file
    public async delete(dir, filename){
        let filePath = `${this.baseDir}${dir}/${filename}.json`;

        try {
            await fs.unlink(filePath);
        } catch (error) {
            if(error instanceof Error){
                throw new AppError(500, error.message);
            }
        } 
    }
}

let dataLibrary = new DataLibrary();

export default dataLibrary;



// ! Callback version

 // fs.open(filePath, 'wx', function(err, fd){
        //     if(!err && fd){
        //         // ! Convert data to string
        //         let stringData = JSON.stringify(data);

        //         // ! start writing in file
        //         fs.writeFile(fd, stringData, function(err){
        //             if(!err){
        //                 fs.close(fd, function(err){
        //                     if(!err){
        //                         callback(`Data has been written successfully`)
        //                     }else{
        //                         callback(`Error while closing the file ${err}`)
        //                     }
        //                 })
        //             }else{
        //                 callback(`Error while writing data ${err}`)
        //             }
        //         })
        //     }else{
        //         callback('Error' + err)
        //     }
        // })