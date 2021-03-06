import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'about', loadChildren: './about/about.module#AboutPageModule' },
  { path: 'manual', loadChildren: './manual/manual.module#ManualPageModule' },
  { path: 'developer', loadChildren: './developer/developer.module#DeveloperPageModule' },
  { path: 'train', loadChildren: './train/train.module#TrainPageModule' },
  { path: 'prediction', loadChildren: './prediction/prediction.module#PredictionPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
