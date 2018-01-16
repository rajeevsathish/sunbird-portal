import { Component, NgModule } from '@angular/core'

@Component({
    selector: 'my-test',
    template: `
    <h1>html template of TestComponent from DynamicModule - src2</h1>
  `
})
export class ExPlugin { }


@NgModule({
    declarations: [ExPlugin],
    exports: [ExPlugin]
})
export class pluginModule { }