import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './auth-module-guard.service';
import { AdminGuardService } from './admin-module-guard.service';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AdminGuardService],
    loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule)
  },
  {
    path: 'auth',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./home/home.module')
      .then(m => m.HomeModule)
  },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModulesRoutingModule { }
