import { Injectable } from '@angular/core';
import { IShipSpec } from '../core/interfaces';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class UiCommunicationService {
  shipSpec$ = new Subject<IShipSpec>();
  shipAddedSpec$ = new Subject<IShipSpec>();

  constructor() {}

  sendNewShipSpec(shipSpec: IShipSpec): void {
    this.shipSpec$.next(shipSpec);
  }

  getShipSpec(): Observable<IShipSpec> {
    return this.shipSpec$.asObservable();
  }
}
