
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
//clog('parseAndRender', tree);
    Fleuron.render(fleuron, tree);

    //Fleuron.highlight(fleuron, '0_1_1_0_2_1_0', '.flrn-active', 'HERE!!!');
    //Fleuron.highlight(fleuron, '0_1_1_0_2_2_3', '.flrn-active', 'HERE!!!');
    //Fleuron.descend(fleuron, '0_1_1_0_2_1_0', '.flrn-visited');
    //Fleuron.descend(fleuron, '0_1_1_0_2_2_3', '.flrn-visited');
    //Fleuron.trail(fleuron, '0_1_1_0_2_1_0', '.flrn-visited', '.flrn-linked');
    //Fleuron.trail(fleuron, '0_1_1_0_2_2_3', '.flrn-visited', '.flrn-linked');
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

