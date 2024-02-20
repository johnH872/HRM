
import { prop, required, minLength, email } from '@rxweb/reactive-form-validators';
export class UserLogin {
    @required()
    @email()
    email!: string;
    @required()
    @minLength({ value: 6 })
    password!: string;
    @prop()
    rememberMe = false;
}
