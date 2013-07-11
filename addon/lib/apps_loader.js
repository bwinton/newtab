;(function(){
  const { sandbox, evaluate, load } = require("sdk/loader/sandbox");
  const data = require('self').data;
  const file = require('sdk/io/file');
  /**
   * requires: an app's id
   * description: will find the app's app.js
   * file and run it to get back the list
   * of items the app wants to display 
   */
  function query_app(id){
    console.log('query: '+id);

    var code = data.url('apps/'+id+'/app.js');
    console.log(code);
    var scope = sandbox(null, {sandboxPrototype: {console: console, exports: {}}});
 
    load(scope, code);
    result = evaluate(scope, 'exports.run()');
    console.log('da result: '+result);

  }

  exports.query_app = query_app;
})();