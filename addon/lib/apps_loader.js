;(function(){
  const { sandbox, evaluate, load } = require("sdk/loader/sandbox");
  const data = require('self').data;
  const file = require('sdk/io/file');
  const chrome = require('chrome');

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
    var scope = sandbox(null, {sandboxPrototype: {chrome:chrome, console:console, require:require, exports: {}}});
 
    var result;
    var success = true;
    try{
      load(scope, code);
      result = evaluate(scope, 'exports.run()');
    }
    catch(e){
      console.error('error getting app data from '+id);
      console.error(e);
      result = [];
      success = false;
    }

    console.log('da result: '+result);
    return [success, result];
  }

  exports.query_app = query_app;
})();