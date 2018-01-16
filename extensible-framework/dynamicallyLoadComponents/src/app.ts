//our root app component
import { NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {
Component, 
ViewContainerRef,
Compiler,
ComponentFactory,
ComponentFactoryResolver,
ModuleWithComponentFactories,
ComponentRef,
ReflectiveInjector,
SystemJsNgModuleLoader,
OnInit} from '@angular/core';

export class ModuleNode { modulePath: string; componentName: string; }

@Component({
  selector: 'my-app',
  template: `
    <div>
       hello
    </div>
  `
})

export class App implements OnInit {

  widgetConfig: string; 
  module: ModuleNode; 
  cmpRef: ComponentRef;
  
  constructor(private viewref: ViewContainerRef,
      private resolver: ComponentFactoryResolver,
      private loader: SystemJsNgModuleLoader,
      private compiler: Compiler){
        this.module = new ModuleNode();
        this.module.modulePath = "src/plugin_1/dynamic.module#pluginModule";
        this.module.componentName = "ExPlugin";
      }
      
  ngOnInit() {
    debugger;
    this.openWebApp(this.module);
  }
      
  
  openWebApp(menu:any) {
    
      this.loader.load(menu.modulePath)  // load the module and its components
          .then((modFac) => {
              // the missing step, need to use Compiler to resolve the module's embedded components
              this.compiler.compileModuleAndAllComponentsAsync<any>(modFac.moduleType)
  
                  .then((factory: ModuleWithComponentFactories<any>) => {
                      return factory.componentFactories.find(x => x.componentType.name === menu.componentName);
                  })
                  .then(cmpFactory => {
  
                      // need to instantiate the Module so we can use it as the provider for the new component
                      let modRef = modFac.create(this.viewref.parentInjector);
                      this.cmpRef = this.viewref.createComponent(cmpFactory, 0, modRef.injector);
                      // done, now Module and main Component are known to NG2
  
                  });
          });
  }
  
  ngOnDestroy() {
      if (this.cmpRef) {
          this.cmpRef.destroy();
      }
  }
}

@NgModule({
  imports: [ BrowserModule ],
  declarations: [ App ],
  providers: [SystemJsNgModuleLoader],
  bootstrap: [ App ]
})
export class AppModule {}