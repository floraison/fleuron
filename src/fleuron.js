
// fleuron.js

var Fleuron = (function() {

  "use strict";

  var self = this;

  //
  // protected functions

  var clean = function(elt) {
    while (elt.firstChild) elt.removeChild(elt.firstChild);
  };
  var create = function(parent, tagname, atts, text) {
    atts = atts || {}; text = text || '';
    var e = document.createElement(tagname);
    for (var k in atts) e.setAttribute(k, atts[k]);
    e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };

  var rs = {};
  rs._children = function(elt, tree) {
//clog('renderChildren()', elt, tree);
    var e = elt.querySelector('.fleuron-children');
    if (Array.isArray(tree[1]))
      tree[1].forEach(function(t) { render(e, t); });
    else
      render(e, tree[1]);
  };
  rs._default = function(elt, tree) {
//clog('default', elt, tree);
    var e = create(
      elt, 'div', {
        class: `fleuron-default fleuron-${tree[0]}`,
        'data-fleuron-line': tree[2],
        'data-fleuron-file': tree[3] });
    create(e, 'span', {}, tree[0]);
    var ce = create(e, 'div', { class: 'fleuron-children' });
    rs._children(e, tree);
    return e;
  };
  rs._leaf = function(elt, tree) {
//clog('_leaf', elt, tree);
    return create(elt, 'div', {}, JSON.stringify(tree));
  };

  var render = function(elt, tree) {

    if (Array.isArray(tree))
      (rs[tree[0]] || rs._default)(elt, tree);
    else
      rs._leaf(elt, tree);
  };

  //
  // public functions

  this.render = function(elt, tree) {

    clean(elt);
    render(elt, tree);
  };

  //
  // done.

  return this;

}).apply({}); // end Fleuron

