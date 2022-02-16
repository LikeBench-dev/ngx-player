import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnotherPageComponent } from './pages/another-page/another-page.component';
import { PlayerModule } from "./modules/player/player.module";

import { SharedModule} from "./shared/shared.module";
import { MainComponent } from './pages/main/main.component';


@NgModule({
  declarations: [
    AppComponent,
    AnotherPageComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PlayerModule,
    SharedModule
  ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
