export const auth  = (phone: string | undefined) => {
    
 return typeof phone == 'string' && phone.trim().length == 10 ? phone : false;
    

}