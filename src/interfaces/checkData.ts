
export interface ICheck {
    protocol?: string,
    url?:string,
    method?:string,
    successCode?: string[],
    timeoutSeconds?: string,
    created_at?:Date,
    updated_at?:Date
}