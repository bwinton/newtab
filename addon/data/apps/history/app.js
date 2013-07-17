function run(){
  var data = get();
  console.log(data)
  return data;
}

/* queries the browser's history */
function get() {
  const {Cu, Cc, Ci} = chrome;
  var historyService = Cc['@mozilla.org/browser/nav-history-service;1']
                         .getService(Ci.nsINavHistoryService);
  var query = historyService.getNewQuery();
  var options = historyService.getNewQueryOptions();
  options.sortingMode = options.SORT_BY_DATE_DESCENDING;
  options.maxResults = 30;
   
  // execute the query
  var result = historyService.executeQuery(query, options);
   
  // iterate over the results
  result.root.containerOpen = true;
  var count = result.root.childCount;
  var data = [];
  for (var i = 0; i < count; i++) {
    var node = result.root.getChild(i);
    // do something with the node properties...
    var title = node.title || node.uri;
    var url = node.uri;
    // var visited = node.accessCount;
    // var lastVisitedTimeInMicrosecs = node.time;
    var iconURI = node.icon; // is null if no favicon available
    if(iconURI)
      iconURI = iconURI.substring(iconURI.indexOf('favicon:')+8);
    data.push({title: title, link: url, image: iconURI});
  }
  // callback(data);
  result.root.containerOpen = false;
  return data;
}
exports.run = run;