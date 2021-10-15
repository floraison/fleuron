
// demo.js

var Demo = (function() {

  "use strict";

  var self = this;
  var textarea = null;
  var fleuron = null;

  //
  // protected functions

  var init = function() {
    textarea = textarea || H.elt('.left-pane textarea');
    fleuron = fleuron || H.elt('.right-pane .fleuron');
  };

  var parseAndRender = function() {
    var tree = JSON.parse(textarea.value);
clog('parseAndRender', tree);
    Fleuron.render(fleuron, tree);
  };

  var onFlowLoaded = function(res) {
    textarea.value = res.request.responseText;
    parseAndRender();
  };

  //
  // public functions

  this.loadFlow = function(name) {
    init();
    H.request('GET', 'flo/' + name, onFlowLoaded);
  };

  //
  // done.

  return this;

}).apply({}); // end Demo

