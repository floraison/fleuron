
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

  rs._children = function(elt, tree, parent) {
//clog('renderChildren()', elt, tree, parent);
    var ce = create(elt, 'div', { class: 'fleuron-children' });
    if (Array.isArray(tree[1]))
      tree[1].forEach(function(t) { render(ce, t, parent); });
    else
      render(ce, tree[1], parent);
    return elt;
  };
  rs._default = function(elt, tree, parent) {
//clog('default', elt, tree);
    //var p = { t0: tree[0] };
    var e = create(
      elt, 'div', {
        class: `fleuron-default fleuron-${tree[0]}`,
        'data-fleuron-line': tree[2],
        'data-fleuron-file': tree[3] });
    create(e, 'span', {}, tree[0]);
    //var ce = create(e, 'div', { class: 'fleuron-children' });
    //getRenderer(elt, '_children')(e, tree, p);
    //return e;
    return renderChildren(e, tree);
  };
  rs._leaf = function(elt, tree, parent) {
//clog('_leaf', elt, tree);
    return create(elt,
      'span', { class: 'fleuron-_leaf' }, JSON.stringify(tree));
  };

  rs._sqs = function(elt, tree, parent) {
    var t = "'" + tree[1].replaceAll(/'/g, "\'") + "'";
    return create(elt, 'span', { class: 'fleuron-_sqs' }, t);
  };
  rs._att = function(elt, tree, parent) {
    //var p = { t0: '_att' };
    //return render(elt, tree[1][0], p);
    var e = create(elt, 'span', { class: 'fleuron-_att' });
    return render(e, tree[1][0], { t0: '_att' });
  };

  // Looks for _fleuron in all parent elements
  //
  var findFleurons = function(elt) {

    if (elt._fleurons) return elt._fleurons;
    if (elt.parentElement) return findFleurons(elt.parentElement);
    return {};
  };

  var getRenderer = function(elt, t0) {

    var fs = findFleurons(elt);

    return fs[t0] || rs[t0] || fs._default || rs._default;
  };

  var renderChildren = function(elt, tree) {

    getRenderer(elt, '_children')(elt, tree, { t0: tree[0] });

    return elt;
  };

  var render = function(elt, tree, parent) {

    return getRenderer(elt, tree[0])(elt, tree, parent);
  };

  //
  // public functions

  this.render = function(elt, tree) {

    clean(elt);
    render(elt, tree, null);
  };

  //
  // done.

  return this;

}).apply({}); // end Fleuron

