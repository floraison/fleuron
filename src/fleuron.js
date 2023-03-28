
// fleuron.js

var Fleuron = (function() {

  "use strict";

  this.VERSION = '1.1.0';

  var self = this;

  //
  // protected functions

  var toggleCollapse = function(elt, ev) {

    if (elt.querySelector('.flrn-children').children.length < 1) return;

    elt.classList.toggle('flrn-collapsed');
  };

  var nodeClick = function(ev) {

    var elt = ev.target.closest('[data-flrn-nid]'); if ( ! elt) return;

    if (elt.classList.contains('flrn-marked')) {
      self.clearAllMarkers(elt);
      return;
    }

    if (ev.shiftKey) self.clearAllMarkers(elt);

    if (ev.shiftKey) {
      if (elt.classList.contains('flrn-visited')) {
        elt.classList.add('flrn-marked');
      }
    }
    else {
      toggleCollapse(elt, ev);
    }

    if (ev.shiftKey) window.getSelection().removeAllRanges();
      // prevent click on node selecting text...
  };

  //var nodeEnter = function(ev) {
  //  var elt = ev.target.closest('[data-flrn-nid]'); if ( ! elt) return;
  //  var fe = elt.closest('.fleuron');
  //  if (ev.shiftKey) fe.classList.add('marking');
  //};
  //var nodeLeave = function(ev) {
  //  var elt = ev.target.closest('[data-flrn-nid]'); if ( ! elt) return;
  //  var fe = elt.closest('.fleuron');
  //  fe.classList.remove('marking');
  //};

  var doCollapse = function(elt) {

    if (elt.querySelector('.flrn-children').children.length < 1) return;

    elt.classList.add('flrn-collapsed');
  };

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
    sequence: '_seq', loop: '_seq', cursor: '_seq',
    define: '_seq', def: '_seq',
    concurrence: '_con',
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

    //var lo = 0; if (self.hasOwnProperty('lineOffset')) lo = self.lineOffset;
    var lo = 0; //if (self.hasOwnProperty('lineOffset')) lo = self.lineOffset;

    //h0e.title = 'nid: ' + tree[4];
    h0e.title = `line ${lo + tree[2]} / nid ${tree[4]}`;

    e.setAttribute('data-flrn-nid', tree[4]);

    h0e.addEventListener('click', nodeClick);
    //h0e.addEventListener('mouseenter', nodeEnter);
    //h0e.addEventListener('mouseleave', nodeLeave);

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
    var e = createFleuronDiv(elt, tree, '_default');
    return renderChildren(e, tree);
  };

  rs._setter = function(elt, tree) {
    var e = rs._default(elt, tree);
    e.classList.add('flrn-_setter');
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

    var t0 = tree[0] === '_if' ? 'if' : 'unless';
    var l = tree[2];
    var t = tree[1][1];
    var n = tree[4];

    t[1].push(
      [ '_att', [
        [ t0, [], l, undefined, n ], tree[1][0]
      ], l, undefined, n ]);

    if (t[1].length > 1 && t[1][0][0] === '_att' && t[1][0][1][0][0] === '_') {
      t[1].shift();
    }

    return t;
  };
  rws._unless = rws._if;

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

    var cn = elt.querySelector(':scope > .flrn-body > .flrn-children');
    if (cn && cn.children.length > 0) {
      elt.querySelector('.flrn-head0').classList.add('flrn-collapsable');
    }

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

  var locate = function(elt) {

    if (typeof elt === 'string') return document.querySelector(elt);
    return elt;
  };

  var splitClasses = function(kla) {

    var ks = null;

    if (typeof kla === 'string') ks = kla.split(/(\s*\.|\s+)/);
    else if (Array.isArray(kla)) ks = kla;
    else ks = [];

    return ks
      .map(function(k) { return k.trim(); })
      .map(function(k) { return k.slice(0, 1) === '.' ? k.slice(1) : k; })
      .filter(function(k) { return k.length > 0; });
  };

  //
  // public functions

  this.render = function(elt, tree) {

    var e = locate(elt);
    var t = nidify(dup(tree), '0');

    clean(e);
    render(e, t, null);
  };

  var addClasses = function(elt, klas) {

    //klas.forEach(function(k) { elt.classList.add(k); });
    elt.classList.add(...klas);
  };

  this.highlight = function(elt, nid, kla, title) {

    var e0 = locate(elt);
    var n = nid.split('-')[0];
    var ks = splitClasses(kla);

    var e = e0.querySelector('[data-flrn-nid="' + n + '"]');
    if ( ! e) return null;

    addClasses(e, ks);

    if (title) {
      e.querySelector('.flrn-head0').title = title;
      e.querySelector('.flrn-tree0').title = title;
    }

    return e;
  };

  this.descend = function(elt, nid, kla) {

    var e0 = locate(elt);
    var n = nid.split('-')[0];
    var ks = splitClasses(kla);

    var e = e0.querySelector('[data-flrn-nid="' + n + '"]');
    if ( ! e) return null;;

    while (true) {
      addClasses(e, ks);
      e = e.parentElement.closest('[data-flrn-nid]'); if ( ! e) break;
    }

    return e;
  };

  this.trail = function(elt, nid, kla, prekla) {

    var e0 = locate(elt);
    var n = nid.split('-')[0];
    var ks = splitClasses(kla);
    var pks = splitClasses(prekla);

    var e = e0.querySelector('[data-flrn-nid="' + n + '"]');
    if ( ! e) return;

    while (true) {

      addClasses(e, ks);

      var pe = e.parentElement.closest('[data-flrn-nid]');

      if ( ! (pe && pe.classList.contains('flrn-_con'))) {

        var seen = false;

        var ce = e.closest('.flrn-child'); while (true) {
          if ( ! ce) break;
          var ee = ce.querySelector('[data-flrn-nid]');
          addClasses(ee, ks);
          if (seen) addClasses(ee, pks);
          seen = true;
          ce = ce.previousElementSibling;
        }
      }

      e = e.parentElement.closest('[data-flrn-nid]'); if ( ! e) break;
    }
  };

  this.flagNid = function(elt, nid) {

    var e0 = locate(elt);
    var n = nid.split('-')[0];

    var ce = e0.querySelector(`[data-flrn-nid="${n}"]`); if ( ! ce) return;
clog(nid, n, ce);

    var v = ce.getAttribute('data-flrn-nids'); v = (v ? (v + ',') : '') + nid;
    ce.setAttribute('data-flrn-nids', v);
  };

  this.collapse = function(/*elt, arguments*/) {

    var as = Array.from(arguments);
    var elt = locate(as.shift());

    as.forEach(function(a, i) {
      var es = null;
      if (a.match(/^\d/)) {
        es = elt.querySelectorAll('[data-flrn-nid="' + a + '"]');
      }
      else {
        es = elt.querySelectorAll('.flrn.flrn-' + a);
      }
      es.forEach(doCollapse);
    });
  };

  this.uncollapse = function(elt) {

    locate(elt).querySelectorAll('.flrn-collapsed').forEach(function(e) {
      e.classList.remove('flrn-collapsed');
    });
  };

  this.clearAllMarkers = function(elt) {

    var fle = elt.closest('.fleuron');

    fle.querySelectorAll('.flrn-marked')
      .forEach(function(e) { e.classList.remove('flrn-marked'); });
  };

  //
  // done.

  return this;

}).apply({}); // end Fleuron

