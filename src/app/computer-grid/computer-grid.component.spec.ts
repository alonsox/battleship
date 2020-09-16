import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComputerGridComponent } from './computer-grid.component';

describe('ComputerGridComponent', () => {
  let component: ComputerGridComponent;
  let fixture: ComponentFixture<ComputerGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComputerGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComputerGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
