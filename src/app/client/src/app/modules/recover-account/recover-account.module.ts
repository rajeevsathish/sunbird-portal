import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecoverAccountRoutingModule } from './recover-account-routing.module';
import { IdentifyAccountComponent, SelectAccountIdentifierComponent, VerifyAccountIdentifierComponent,
  RecoverAccountComponent } from './components';
import { SharedModule } from '@sunbird/shared';
import { CoreModule } from '@sunbird/core';
import { TelemetryModule } from '@sunbird/telemetry';
import { SharedFeatureModule } from '@sunbird/shared-feature';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';

@NgModule({
  declarations: [IdentifyAccountComponent, SelectAccountIdentifierComponent, VerifyAccountIdentifierComponent,
    RecoverAccountComponent],
  imports: [
    CommonModule,
    RecoverAccountRoutingModule,
    SharedModule,
    CoreModule,
    RecaptchaModule,
    TelemetryModule,
    SharedFeatureModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class RecoverAccountModule { }
