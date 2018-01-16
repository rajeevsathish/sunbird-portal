
export class pluginFramework{
	pluginName=['plugin_1']
	my_data: any;
  public getResponseData() {
      if(typeof(this.my_data) === "undefined") {
      	var url = this.pluginName[0]+"/manifest.json";
          jQuery.ajax({
            async: false,
            url: url,
            dataType: {}
        }).done(function(data) {
            console.log(data)
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if(jqXHR.statusText === 'OK') {
                console.log('Unable to load resource:', url, 'error:', errorThrown);
            }
            
        });   
      } else {
          
      }


  }

}


