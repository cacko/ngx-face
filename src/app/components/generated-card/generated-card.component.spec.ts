import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratedCardComponent } from './generated-card.component';

describe('GeneratedCardComponent', () => {
  let component: GeneratedCardComponent;
  let fixture: ComponentFixture<GeneratedCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneratedCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneratedCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
