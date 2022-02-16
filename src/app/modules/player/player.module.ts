import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from './player.component';
import { PlayerControlsComponent } from './player-controls/player-controls.component';



@NgModule({
  declarations: [
    PlayerComponent,
    PlayerControlsComponent
  ],
  exports: [
    PlayerComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PlayerModule { }
