
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

  var createFleuronDiv = function(elt, tree, name) {

    var c = [ 'fleuron', `fleuron-${name}` ];
    if (name !== tree[0]) c.push(`fleuron-${tree[0]}`)

    var as = { class: c.join(' '), 'data-fleuron-line': tree[2] };
    if (tree[3]) as['data-fleuron-file'] = tree[3];

    var e = create(elt, 'div', as);
    create(e, 'div', { class: 'fleuron-head' });
    create(e, 'div', { class: 'fleuron-tree0' }, tree[0]);

    return e;
  };

  var rs = {};

  rs._children = function(elt, tree, parent) {

//clog('renderChildren()', elt, tree, parent);
    if ( ! Array.isArray(tree[1])) { render(ce, tree[1], parent); return elt; }

    var ae = create(elt, 'div', { class: 'fleuron-attributes' });
    var ce = create(elt, 'div', { class: 'fleuron-children' });

    tree[1].forEach(function(t) {
      if (t[0] === '_att') {
        render(ae, t, parent);
      }
      else {
        var e = create(ce, 'div', { class: 'fleuron-child' });
        render(e, t, parent);
      }
    });

    //if (ae.childElementCount < 1) elt.removeChild(ae);
    //if (ce.childElementCount < 1) elt.removeChild(ce);

    return elt;
  };

  rs._default = function(elt, tree, parent) {
//clog('default', elt, tree);
    var e = createFleuronDiv(elt, tree, '_default');
    return renderChildren(e, tree);
  };

  rs._leaf = function(elt, tree, parent) {
//clog('_leaf', elt, tree);
    return create(elt,
      'div', { class: 'fleuron-_leaf' }, JSON.stringify(tree));
  };

  //rs.sequence = function(elt, tree, parent) {
  //  var e = createFleuronDiv(elt, tree, 'sequence');
  //  renderChildren(e, tree);
  //  return e;
  //};
  rs._sqs = function(elt, tree, parent) {
    var t = "'" + tree[1].replaceAll(/'/g, "\'") + "'";
    return create(elt, 'div', { class: 'fleuron-_sqs' }, t);
  };
  rs._att = function(elt, tree, parent) {
    //var p = { t0: '_att' };
    //return render(elt, tree[1][0], p);
    var e = create(elt, 'div', { class: 'fleuron-_att' });
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

