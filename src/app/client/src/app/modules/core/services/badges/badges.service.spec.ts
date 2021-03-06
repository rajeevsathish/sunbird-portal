import { TestBed, inject } from '@angular/core/testing';
import { LearnerService } from '@sunbird/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ConfigService } from '@sunbird/shared';
import { BadgesService } from './badges.service';
import { configureTestSuite } from '@sunbird/test-util';

describe('BadgesService', () => {
  configureTestSuite();
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [BadgesService, ConfigService, HttpClient, LearnerService]
    });
  });

  it('should be created', inject([BadgesService], (service: BadgesService) => {
    expect(service).toBeTruthy();
  }));
});
