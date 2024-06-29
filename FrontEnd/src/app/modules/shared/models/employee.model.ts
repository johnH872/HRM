import { compare, email, minLength, prop, required } from "@rxweb/reactive-form-validators";
import { RoleModel } from "./role-model";

export class EmployeeModel {
    @prop()
    userId: string;
    @prop()
    firstName: string;
    @prop()
    middleName: string;
    @prop()
    lastName: string;
    @prop()
    @email()
    @required()
    email: string;
    @prop()
    birth: Date | string | null;
    @prop()
    gender: string;
    @prop()
    nationality: string;
    @prop()
    avatarUrl: string;
    @prop()
    phoneNumber: string;
    @prop()
    jobTitle: string;
    @prop()
    dateStartContract: Date | string | null;
    @prop()
    ownerId: string;
    @prop()
    @minLength({ value: 6 })
    password: string;
    @compare({ fieldName: 'password', message: 'Confirm Password are not matched' })
    @minLength({ value: 6 })
    confirmPassword!: string;
    @prop()
    @required()
    roleId: string[];

    isAppliedFace: boolean;
    
    Roles: RoleModel[];
    displayName: string;
    manager: EmployeeModel;
}