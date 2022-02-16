import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnotherPageComponent } from "./pages/another-page/another-page.component";
import { MainComponent } from "./pages/main/main.component";

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'another', component: AnotherPageComponent },
  {
    path: '**',
    redirectTo: 'another',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
