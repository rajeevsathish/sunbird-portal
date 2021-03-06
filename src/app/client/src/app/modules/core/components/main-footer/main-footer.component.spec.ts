import { RouterTestingModule } from '@angular/router/testing';
import { WebExtensionModule } from '@project-sunbird/web-extensions';
import { ActivatedRoute } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { ResourceService, ConfigService, SharedModule } from '@sunbird/shared';
import { MainFooterComponent } from './main-footer.component';
import { CacheService } from 'ng2-cache-service';
import { of } from 'rxjs';
import { TelemetryModule } from '@sunbird/telemetry';
import { CoreModule, UserService } from '@sunbird/core';
import { TenantService } from '../../services';
import { configureTestSuite } from '@sunbird/test-util';

describe('MainFooterComponent', () => {
    let component: MainFooterComponent;
    let fixture: ComponentFixture<MainFooterComponent>;
    let userService;
    let tenantService;
    const mockActivatedRoute = {
        queryParams: of({
            dialCode: 'EJ23P',
            source: 'paytm'
        }),
        snapshot: {
            firstChild: {
                firstChild: {
                    params: {
                        slug: 'sunbird'
                    }
                }
            }
        },
        firstChild: {
            firstChild: {
                snapshot: {
                    data: {
                        sendUtmParams: false
                    }
                },
                params: of({})
            }
        },
        path: 'resource'
    };
    const response = {
        'id': 'api.system.settings.get.tn',
        'ver': 'v1',
        'ts': '2020-04-16 13:27:29:548+0000',
        'params': {
            'resmsgid': null,
            'msgid': null,
            'err': null,
            'status': 'success',
            'errmsg': null
        },
        'responseCode': 'OK',
        'result': {
            'response': {
                'id': 'tn',
                'field': 'tn',
                'value': 'tenantConfig'
            }
        }
    };
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            providers: [CacheService, ConfigService, { provide: ResourceService, useValue: { instance: 'SUNBIRD' } }, {
                provide: ActivatedRoute, useValue: mockActivatedRoute
            }],
            imports: [CoreModule, HttpClientModule, WebExtensionModule.forRoot(),
                TelemetryModule.forRoot(), SharedModule, RouterTestingModule],
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainFooterComponent);
        component = fixture.componentInstance;
        userService = TestBed.get(UserService);
        spyOn(component, 'footerAlign'); // new line to be added
        tenantService = TestBed.get(TenantService);
        fixture.detectChanges();
    });

    it('should redirect to diksha app with UTM params if dialcode avaiable', () => {
        TestBed.get(ActivatedRoute).firstChild.firstChild.snapshot.data.sendUtmParams = true;
        fixture.detectChanges();
        const spy = spyOn(component, 'redirect');
        spyOnProperty(userService, 'slug', 'get').and.returnValue('sunbird');
        component.redirectToMobileApp();
        expect(spy).toHaveBeenCalledWith('https://play.google.com/store/apps/details?id=in.gov.diksha.app&referrer=utm_source=' +
        TestBed.get(ResourceService).instance + '-sunbird&utm_medium=paytm&utm_campaign=dial&utm_term=EJ23P');

    });

    it('should redirect to diksha app with UTM params if dialcode is not avaiable', () => {
        TestBed.get(ActivatedRoute).firstChild.firstChild.snapshot.data.sendUtmParams = true;
        TestBed.get(ActivatedRoute).queryParams = of({ dialCode: '' });
        fixture.detectChanges();
        spyOnProperty(userService, 'slug', 'get').and.returnValue('sunbird');
        const spy = spyOn(component, 'redirect');
        component.redirectToMobileApp();
        expect(spy).toHaveBeenCalledWith('https://play.google.com/store/apps/details?id=in.gov.diksha.app&referrer=utm_source=' +
        TestBed.get(ResourceService).instance + '-sunbird&utm_medium=get&utm_campaign=redirection');
    });

    it('should redirect to diksha app without UTM params if not avaiable', () => {
        TestBed.get(ActivatedRoute).firstChild.firstChild.snapshot.data.sendUtmParams = false;
        fixture.detectChanges();
        const spy = spyOn(component, 'redirect');
        spyOnProperty(userService, 'slug', 'get').and.returnValue('sunbird');
        component.redirectToMobileApp();
        expect(spy).toHaveBeenCalledWith('https://play.google.com/store/apps/details?id=in.gov.diksha.app&referrer=utm_source=' +
        TestBed.get(ResourceService).instance + '-sunbird&utm_medium=');
    });

});
