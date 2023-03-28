
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

    Fleuron.highlight(fleuron, '0', '.flrn-visited');
    Fleuron.highlight(fleuron, '0_0', '.flrn-visited');
    Fleuron.highlight(fleuron, '0_1', '.flrn-visited');
    Fleuron.highlight(fleuron, '0_2', '.flrn-visited .flrn-active');

    Fleuron.trail(fleuron, '0_0', '.flrn-linked');
    Fleuron.trail(fleuron, '0_1', '.flrn-linked');
    //Fleuron.trail(fleuron, '0_2', '.flrn-linked');

    Fleuron.flagNid(fleuron, '0');
    Fleuron.flagNid(fleuron, '0_0-123');
    Fleuron.flagNid(fleuron, '0_0-456');
    Fleuron.flagNid(fleuron, '0_1-789');
    Fleuron.flagNid(fleuron, '0_2-321');
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

