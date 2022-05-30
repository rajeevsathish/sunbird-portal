import { of, throwError, Subscription, Subject } from 'rxjs';
import { first, mergeMap, map, tap, catchError, filter, takeUntil } from 'rxjs/operators';
import {
  ConfigService, ResourceService, Framework, BrowserCacheTtlService, UtilService, LayoutService
} from '@sunbird/shared';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, OnDestroy, ViewRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FrameworkService, FormService, PermissionService, UserService, OrgDetailsService } from '@sunbird/core';
import * as _ from 'lodash-es';
import { CacheService } from 'ng2-cache-service';
import { IInteractEventEdata } from '@sunbird/telemetry';
import { DataDrivenFilterComponent } from './data-driven-filter.component';
import { mockFrameworkData } from '../../../core/services/framework/framework.mock.spec.data';

describe('DataDrivenFilterComponent', () => {
  let component: DataDrivenFilterComponent;
  const mockConfigService: Partial<ConfigService> = {

  };
  const mockResourceService: Partial<ResourceService> = {
    languageSelected$: of({ language: 'en' }) as any
  };
  const mockRouter: Partial<Router> = {
    url: '/resources/view-all/Course-Unit/1',
    navigate: jest.fn()
  };
  const mockActivatedRoute: Partial<ActivatedRoute> = {};
  const mockCacheService: Partial<CacheService> = {
    set: jest.fn(),
    get: jest.fn()
  };
  const mockCdr: Partial<ChangeDetectorRef> = {};
  const mockFrameworkService: Partial<FrameworkService> = {
    frameworkData$: of({
      defaultFramework: {
          code: 'CODE'
      }
  }) as any,
  initialize:jest.fn(),
  };
  const mockFormService: Partial<FormService> = {};
  const mockUserService: Partial<UserService> = {};
  const mockPermissionService: Partial<PermissionService> = {};
  const mockUtilService: Partial<UtilService> = {};
  const mockBrowserCacheTtlService: Partial<BrowserCacheTtlService> = {};
  const mockOrgDetailsService: Partial<OrgDetailsService> = {};
  const mockLayoutService: Partial<LayoutService> = {};

  beforeAll(() => {
    component = new DataDrivenFilterComponent(
      mockConfigService as ConfigService,
      mockResourceService as ResourceService,
      mockRouter as Router,
      mockActivatedRoute as ActivatedRoute,
      mockCacheService as CacheService,
      mockCdr as ChangeDetectorRef,
      mockFrameworkService as FrameworkService,
      mockFormService as FormService,
      mockUserService as UserService,
      mockPermissionService as PermissionService,
      mockUtilService as UtilService,
      mockBrowserCacheTtlService as BrowserCacheTtlService,
      mockOrgDetailsService as OrgDetailsService,
      mockLayoutService as LayoutService
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be create a instance of DataDrivenFilterComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should call the ngOnInit method', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 992
    });
    jest.spyOn(component, 'getFormatedFilterDetails').mockImplementation(() => {
      return of({
        mockFrameworkData
      }) as any;
  });
    component['selectedLanguage'] = 'en';
    component.formFieldProperties = [{test: 'abc', range:'abcd'}, {test: 'mno', range:'mnop'}];
    jest.spyOn(component.frameworkService, 'initialize');
    component.formInputData = {test: 'abc', range:'abcd'};
    component.ngOnInit();
    expect(component.frameworkService.initialize).toBeCalled();
    expect(component.getFormatedFilterDetails).toBeCalled();
  });
});
