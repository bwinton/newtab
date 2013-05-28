;(function(){
    var Header = function(){


      /* 
      DATA
      */
      this.data = {
        searchProviders: [],
        searchProvider: undefined
      };

      this.init();


      /* 
      EVENTS
      */

      /* Handle the search form. */
      $('#searchForm').submit(function onSearchSubmit(aEvent) {
        var searchTerms = $("#searchText").val();
        alert("search for: "+ searchTerms);
      });

      /* click on search provider logo */
      $('#searchEngineLogo').click(function () {
        this.toggleMenu();
      }.bind(this));

    };

    Header.prototype.init = function(){
      
      /* setup search providers */
      var searchProviders =  [
        {'name': 'Demo Google', 'image': 'google', 'searchURL': 'https://www.google.com/search?q=_searchTerms_&ie=utf-8&oe=utf-8&aq=t&rls=org.mozilla:en-US:unofficial&client=firefox-a&channel=np&source=hp'},
        {'name': 'Demo Yahoo', 'image': 'yahoo', 'searchURL': 'http://search.yahoo.com/search?p=_searchTerms_&ei=UTF-8&fr='},
        {'name': 'Demo Bing', 'image': 'bing', 'searchURL': 'http://www.bing.com/search?q=_searchTerms_'},
        {'name': 'Demo Amazon.com', 'image': 'amazon', 'searchURL': 'http://www.amazon.com/exec/obidos/external-search/?field-keywords=_searchTerms_&mode=blended&tag=mozilla-20&sourceid=Mozilla-search'},
        {'name': 'Demo eBay', 'image': 'ebay', 'searchURL': 'http://rover.ebay.com/rover/1/711-47294-18009-3/4?mpre=http://shop.ebay.com/?_nkw=_searchTerms_'},
        {'name': 'Demo Twitter', 'image': 'twitter', 'searchURL': 'https://twitter.com/search?q=_searchTerms_&partner=Firefox&source=desktop-search'},
        {'name': 'Demo Wikipedia (en)', 'image': 'wikipedia', 'searchURL': 'http://en.wikipedia.org/wiki/Special:Search?search=_searchTerms_&sourceid=Mozilla-search'}
      ];

      $.each(searchProviders, function(i, provider){
        this.addSearchProvider(provider);
      }.bind(this));

      this.setSearch(0); /* sets the search provider to Google */

      /* hide engines */
      $("#searchEngineContainer").hide();
    };


    /* sets the search provider */
    Header.prototype.setSearch = function(index){
      /* index is an index into data.searchProviders */
      this.data.searchProvider = index;

      var searchProvider = this.data.searchProviders[index];
      var $logo = $("#searchEngineLogo");

      /* set logo etc */
      $logo.attr('alt', searchProvider.name);
      $logo.attr('src', getRealImageLoc(searchProvider.image));


    };

    /* adds information about a search provider to the app */
    Header.prototype.addSearchProvider = function(provider){
      /* add to data.searchProviders */
      this.data.searchProviders.push(provider);
      /* rerender search box */
      var providers = this.data.searchProviders;
      var $enginesContainer = $("#searchEngines").empty();
      $.each(providers, function(i, provider){
        // if(i>0) return;
        console.log(i);
        $("<div>").addClass("engine").append(
          $("<img>")
          .attr("src", getRealImageLoc(provider.image))
          .attr("alt", provider.name)
        )
        .appendTo($enginesContainer);
      });
    };


    Header.prototype.toggleMenu = function(){
      $("#searchEngineLogo").toggleClass("expanded");
      $("#searchEngineContainer").slideToggle();
        // interesting('searchChanged', engine.data('engine'));
      // $('#clickjack').toggle();
    };


    /* private helpers */
    function getRealImageLoc(imageName){
      return "../images/SearchEngines/" +imageName+".png";
    }

    /* export */
    window.Header = Header;

})();