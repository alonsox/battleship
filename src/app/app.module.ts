import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './header/header.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { PlayerGridComponent } from './player-grid/player-grid.component';
import { MessageBannerComponent } from './message-banner/message-banner.component';
import { ComputerGridComponent } from './computer-grid/computer-grid.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ControlPanelComponent,
    PlayerGridComponent,
    MessageBannerComponent,
    ComputerGridComponent,
  ],
  imports: [BrowserModule, CoreModule, SharedModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
