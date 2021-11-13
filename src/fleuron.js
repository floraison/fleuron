
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
    sequence: '_seq', loop: '_seq', cursor: '_seq', define: '_seq',
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
    var h0e = create(he, 'div', { class: 'flrn-head0' });
    var be = create(e, 'div', { class: 'flrn-body' });
    create(be, 'div', { class: 'flrn-tree0' }, tree[0]);

    //h0e.title = 'nid: ' + tree[4];
    H.setAtt(e, '-flrn-nid', tree[4]);

    return e;
  };

  // renderers...

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

  rs._setter = function(elt, tree) {
    var e = rs._default(elt, tree);
    e.className = e.className + ' flrn-_setter';
    e.querySelector('.flrn-atts').innerHTML = tree[1][0][1][0][0];
    return e;
  }
  rs.set = rs._setter;
  rs.define = rs._setter;

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
    var e = create(elt, 'div', { class: 'flrn-_att' });
    if (tree[1].length === 1) {
      return render(e, tree[1][0]);
    }
    //if (tree[1].length === 2) {
      rs._key(e, tree[1][0]);
      render(e, tree[1][1]);
      return e;
    //}
  };

  // rewriters...

  var rws = {};

  rws._if = function(tree) {

    var l = tree[2];
    var t = tree[1][1];
    var n = tree[4];

    t[1].push(
      [ '_att', [
        [ 'if', [], l, undefined, n ], tree[1][0]
      ], l, undefined, n ]);

    if (t[1].length > 1 && t[1][0][0] === '_att' && t[1][0][1][0][0] === '_') {
      t[1].shift();
    }

    return t;
  };

  var rewrite = function(tree) {

    var rw = rws[tree[0]];
    var t = rw ? rw(tree) : tree;

    return t;
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

  var nidify = function(t, nid) {

    if ( ! Array.isArray(t)) return;
    if (t.length < 4) { t.push(undefined); } t.push(nid);

    if (Array.isArray(t[1])) t[1].forEach(function(tt, i) {
      nidify(tt, nid + '_' + i);
    });

    return t;
  };

  //
  // public functions

  this.render = function(elt, tree) {

    var t = nidify(dup(tree), '0');

    clean(elt);
    render(elt, t, null);
  };

  //
  // done.

  return this;

}).apply({}); // end Fleuron

