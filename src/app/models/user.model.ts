//* Why would we create model from a class instead of interface?
//* Class is a feature of JS, Interface is a feature of TS.
//* Class is supported by the browser so it doesnt transpiled, while Interface do not supported by the browser so it will get transpiled
//* Class can have methods, Interface cant
//* Class for modeling complicated object, Interface for basic object

export default interface IUser {
    email: string,
    password?: string,
    age: number,
    name: string,
    phoneNumber: string
}

// export default class IUser {
//     email?: string;
//     password?: string;
//     name?: string;
//     age?: number;
//     phoneNumber?: string;
// }