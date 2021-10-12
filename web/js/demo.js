
// demo.js

var Demo = (function() {

  "use strict";

  var self = this;

  //
  // protected functions

  var onFlowLoaded = function(res) {
clog(res);
  };

  //
  // public functions

  this.loadFlow = function(name) {

    H.request('GET', 'flo/' + name, onFlowLoaded);
  };

  //
  // done.

  return this;

}).apply({}); // end Demo

