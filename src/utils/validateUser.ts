export interface IUser {
    firstName: string,
    lastName: string,
    phone:string,
    password:string,
    tosArgreement : boolean
}

export const validateUser  = (data: IUser) => {
    let firstName = typeof (data.firstName) == 'string' && data.firstName.trim().length > 0 ? data.firstName.trim() : false;
    let lastName = typeof (data.lastName) == 'string' && data.lastName.trim().length > 0 ? data.lastName.trim() : false;
    let phone = typeof (data.phone) == 'string' && data.phone.trim().length == 10 ? data.phone.trim() : false;
    let password = typeof (data.password) == 'string' && data.password.trim().length > 6 ? data.password.trim() : false;
    let tosArgreement = typeof (data.tosArgreement) == 'boolean' && data.tosArgreement == true ? true : false;
    
    if(firstName && lastName && phone && password && tosArgreement){
        return true;
    }else{
        return false;
    }


}

