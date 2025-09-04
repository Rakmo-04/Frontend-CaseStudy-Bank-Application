export class User {
  constructor(
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public dateOfBirth: string, // or Date
    public gender: string,
    public aadharNumber: string,
    public panNumber: string,
    public city: string,
    public state: string,
    public zipCode: string,
    public country: string,
    public profilePhotoUrl: string
  ) {}
}
