xtag.register("history", {
  onCreate: function(){
    var self = $(this);
    var icon = 'http://g.etfv.co/' + self.attr('url');
    if (self.attr('img'))
      icon = self.attr('img');

    self.html('<div class="media">' +
        '<div class="img"><img src="' +
          icon + '"></div>' +
        '<div class="bd">' +
            '<div class="title">' + self.text() + '</div>' +
            '<div class="url">' + self.attr('url') + '</div>' +
        '</div>' +
    '</div>');
  }
});

xtag.register("site", {
  onCreate: function(){
    var self = $(this);

    if (self.attr('url')) {
      var thumb = 'moz-page-thumb://thumbnail?url=' + encodeURIComponent(self.attr('url'));
      if (self.attr('img'))
        thumb = 'https://people.mozilla.com/~bwinton/newtab/images/' + self.attr('img') + '.png';
      self.html('<div class="newtab-link" ' +
          'title="' + self.text() + ' ' + self.attr('url') + '" ' +
          'href="' + self.attr('url') + '">' +
        '<div class="newtab-thumbnail" ' +
          'style="background-image: ' +
          'url(' + thumb + ');"></div>' +
        '<div class="newtab-title">' + self.text() + '</div>' +
      '</div>');
    } else {
      self.html('<div class="newtab-link blank">' +
        '<div class="newtab-thumbnail"></div>' +
        '<div class="newtab-title"></div>' +
      '</div>');
    }
  }
});
