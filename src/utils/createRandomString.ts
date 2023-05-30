export const createRandomString = (strLength: number) => {
    if(strLength > 0){
        let characters = `abcdefghijklmnopqrstuvwxyz0123456789`;
        let id = '';
        for (let index = 1; index <= strLength; index++) {
            id+= characters.charAt(Math.floor(Math.random() * characters.length))
        }

        return id;
    }else{
        return false;
    }
}