import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OnboardingUserSelectionComponent } from './onboarding-user-selection.component';
import { SharedModule, ResourceService } from '@sunbird/shared';
import { TelemetryModule } from '@sunbird/telemetry';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF } from '@angular/common';
import { configureTestSuite } from '@sunbird/test-util';

describe('OnboardingUserSelectionComponent', () => {
  let component: OnboardingUserSelectionComponent;
  let fixture: ComponentFixture<OnboardingUserSelectionComponent>;

  const resourceMockData = {
    frmelmnts: {
      lbl: {
        teacher: 'Teacher',
        student: 'Student',
        other: 'Other'
      }
    }
  };
  configureTestSuite();
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OnboardingUserSelectionComponent],
      imports: [
        TelemetryModule.forRoot(),
        SharedModule.forRoot(),
        HttpClientTestingModule,
        RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: ResourceService, useValue: resourceMockData }, {provide: APP_BASE_HREF, useValue: 'test'}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingUserSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngOnInit', () => {
    spyOn(component, 'setPopupInteractEdata');
    component.ngOnInit();
    expect(component.setPopupInteractEdata).toHaveBeenCalled();
    expect(component.selectedUserType).toEqual(undefined);
  });

  it('should call selectUserType', () => {
    component.selectUserType(1);
    expect(component.selectedUserType).toBe(component.guestList[1]);
  });

  it('should call submit', () => {
    component.selectedUserType = component.guestList[1];
    spyOn(localStorage, 'setItem');
    spyOn(component.userSelect, 'emit');
    component.submit();
    expect(localStorage.setItem).toHaveBeenCalledWith('userType', 'student');
    expect(component.userSelect.emit).toHaveBeenCalledWith(true);
  });

});
