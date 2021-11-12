
// fleuron.js

var Fleuron = (function() {

  "use strict";

  this.VERSION = '1.0.0';

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

  var dup = function(o) { return JSON.parse(JSON.stringify(o)); };

  var cats = {
    sequence: '_seq', loop: '_seq', define: '_seq',
    '==': '_cmp', '!=': '_cmp'
      };

  var createFleuronDiv = function(elt, tree, name) {

    var c = [ 'flrn', `flrn-${name}` ];
    if (name !== tree[0]) c.push(`flrn-${tree[0]}`);
    var cat = cats[tree[0]]; if (cat) c.push(`flrn-${cat}`);

    var as = { class: c.join(' '), 'data-flrn-line': tree[2] };
    if (tree[3]) as['data-flrn-file'] = tree[3];

    var e = create(elt, 'div', as);

    var he = create(e, 'div', { class: 'flrn-head' });
    create(he, 'div', { class: 'flrn-head0' });
    var be = create(e, 'div', { class: 'flrn-body' });
    create(be, 'div', { class: 'flrn-tree0' }, tree[0]);

    return e;
  };

  var rs = {};

  rs._children = function(elt, tree) {

//clog('renderChildren()', elt, tree);
    //if ( ! Array.isArray(tree[1])) { render(ce, tree[1]); return elt; }

    var be = elt.querySelector('.flrn-body');
    var ae = create(be, 'div', { class: 'flrn-atts' });
    var ce = create(be, 'div', { class: 'flrn-children' });

    tree[1].forEach(function(t) {
      if (t[0] === '_att') {
        render(ae, t);
      }
      else {
        var e = create(ce, 'div', { class: 'flrn-child' });
        render(e, t);
      }
    });

    //if (ae.childElementCount < 1) elt.removeChild(ae);
    //if (ce.childElementCount < 1) elt.removeChild(ce);

    return elt;
  };

  rs._default = function(elt, tree) {
//clog('_default', elt, tree);
    var e = createFleuronDiv(elt, tree, '_default');
    return renderChildren(e, tree);
  };

  rs._leaf = function(elt, tree) {
//clog('_leaf', elt, tree);
    return create(elt,
      'div', { class: 'flrn-_leaf' }, JSON.stringify(tree));
  };

  //rs.sequence = function(elt, tree) {
  //  var e = createFleuronDiv(elt, tree, 'sequence');
  //  renderChildren(e, tree);
  //  return e;
  //};
  rs._ = function(elt, tree) {
    var t = '_';
    return create(elt, 'div', { class: 'flrn-_' }, t);
  };
  rs._num = function(elt, tree) {
    var t = '' + tree[1];
    return create(elt, 'div', { class: 'flrn-_num' }, t);
  };
  rs._sqs = function(elt, tree) {
    var t = "'" + tree[1].replaceAll(/'/g, "\'") + "'";
    return create(elt, 'div', { class: 'flrn-_sqs' }, t);
  };
  rs._ref = function(elt, tree) {
    var t = tree[1].map(function(t) { return t[1]; }).join('.');
    return create(elt, 'div', { class: 'flrn-_ref' }, t);
  };

  rs._key = function(elt, tree) {
    var t = tree[0];
    return create(elt, 'div', { class: 'flrn-_att-key' }, t);
  };
  rs._att = function(elt, tree) {
    //var p = { t0: '_att' };
    //return render(elt, tree[1][0], p);
      //
    //var e = create(elt, 'div', { class: 'flrn-_att' });
    //return render(e, tree[1][0], { t0: '_att' });
      //
    var e = create(elt, 'div', { class: 'flrn-_att' });
    if (tree[1].length === 1) {
      return render(e, tree[1][0]);
    }
    if (tree[1].length === 2) {
      rs._key(e, tree[1][0]);
      render(e, tree[1][1]);
      return e;
    }
    //else {
    //}
  };

  var rws = {};

  rws._if = function(tree) {
    var l = tree[2];
    var t = dup(tree[1][1]);
    t[1].push([ '_att', [ [ 'if', [], l ], dup(tree[1][0]) ], l ]);
    return t;
  };

  var rewrite = function(tree) {

    var rw = rws[tree[0]];
    return rw ? rw(tree) : tree;
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

    getRenderer(elt, '_children')(elt, tree);

    return elt;
  };

  var render = function(elt, tree) {

    var t = rewrite(tree);

    return getRenderer(elt, t[0])(elt, t);
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

