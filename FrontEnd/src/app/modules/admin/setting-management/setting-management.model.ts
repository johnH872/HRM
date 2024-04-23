import { prop, required } from '@rxweb/reactive-form-validators';

export class SettingModel {
    @prop()
    @required()
    key: string;
    @prop()
    @required()
    group: string;
    @prop()
    value: string | null;
}

export class EditSettingModel {
    oldSetting: SettingModel;
    newSetting: SettingModel;
}