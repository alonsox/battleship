import { Component } from '@angular/core';
import { UiCommunicationService } from './services/ui-communication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UiCommunicationService],
})
export class AppComponent {
  humanPlayerId: number;

  setHumanPlayerId($event: number): void {
    this.humanPlayerId = $event;
  }
}
