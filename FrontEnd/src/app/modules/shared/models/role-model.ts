import { prop, required } from "@rxweb/reactive-form-validators";

export class RoleModel {
    @prop()
    roleId: string;
    @prop()
    @required()
    roleName: string;
    @prop()
    roleDescription: string;
    @prop()
    @required()
    displayName: string;
    @prop()
    defaultScreen: string;
    @prop()
    @required()
    priority: number;
    @prop()
    isShow: boolean;   
}
