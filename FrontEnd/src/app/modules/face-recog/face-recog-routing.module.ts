import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PunchInOutWebcamComponent } from './punch-in-out-webcam/punch-in-out-webcam.component';

const routes: Routes = [
  {
    path: '',
    component: PunchInOutWebcamComponent,
    children: [
      {
        path: 'punch-in-out',
        component: PunchInOutWebcamComponent,
      },
    ] 
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FaceRecogRoutingModule { }
