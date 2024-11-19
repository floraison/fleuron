
// fleuron.js

var Fleuron = (function() {

  "use strict";

  this.VERSION = '1.1.1';

  let self = this;

  //
  // protected functions

  let toggleCollapse = function(elt, ev) {

    if (elt.querySelector('.flrn-children').children.length < 1) return;

    elt.classList.toggle('flrn-collapsed');
  };

  let nodeClick = function(ev) {

    let elt = ev.target.closest('[data-flrn-nid]'); if ( ! elt) return;

    if (elt.classList.contains('flrn-marked')) {
      self.clearAllMarkers(elt);
      return;
    }

    if (ev.shiftKey) self.clearAllMarkers(elt);

    if (ev.shiftKey) {
      //if (elt.classList.contains('flrn-visited')) {
      if (elt.getAttribute('data-flrn-nids')) {
        elt.classList.add('flrn-marked');
      }
    }
    else {
      toggleCollapse(elt, ev);
    }

    if (ev.shiftKey) window.getSelection().removeAllRanges();
      // prevent click on node selecting text...
  };

  //let nodeEnter = function(ev) {
  //  let elt = ev.target.closest('[data-flrn-nid]'); if ( ! elt) return;
  //  let fe = elt.closest('.fleuron');
  //  if (ev.shiftKey) fe.classList.add('marking');
  //};
  //let nodeLeave = function(ev) {
  //  let elt = ev.target.closest('[data-flrn-nid]'); if ( ! elt) return;
  //  let fe = elt.closest('.fleuron');
  //  fe.classList.remove('marking');
  //};

  let doCollapse = function(elt) {

    if (elt.querySelector('.flrn-children').children.length < 1) return;

    elt.classList.add('flrn-collapsed');
  };

  let clean = function(elt) {
    while (elt.firstChild) elt.removeChild(elt.firstChild);
  };
  let create = function(parent, tagname, atts, text) {
    atts = atts || {}; text = text || '';
    let e = document.createElement(tagname);
    for (let k in atts) e.setAttribute(k, atts[k]);
    e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  };

  let dup = function(o) { return JSON.parse(JSON.stringify(o)); };

  let cats = {
    sequence: '_seq', loop: '_seq', cursor: '_seq',
    define: '_seq', def: '_seq',
    concurrence: '_con',
    '==': '_cmp', '!=': '_cmp'
      };

  let createFleuronDiv = function(elt, tree, name) {

    let c = [ 'flrn', `flrn-${name}` ];
    if (name !== tree[0]) c.push(`flrn-${tree[0]}`);
    let cat = cats[tree[0]]; if (cat) c.push(`flrn-${cat}`);

    let as = { class: c.join(' '), 'data-flrn-line': tree[2] };
    if (tree[3]) as['data-flrn-file'] = tree[3];

    let e = create(elt, 'div', as);

    let he = create(e, 'div', { class: 'flrn-head' });
    let h0e = create(he, 'div', { class: 'flrn-head0' });
    let be = create(e, 'div', { class: 'flrn-body' });
    create(be, 'div', { class: 'flrn-tree0' }, tree[0]);

    //let lo = 0; if (self.hasOwnProperty('lineOffset')) lo = self.lineOffset;
    let lo = 0; //if (self.hasOwnProperty('lineOffset')) lo = self.lineOffset;

    //h0e.title = 'nid: ' + tree[4];
    h0e.title = `line ${lo + tree[2]} / nid ${tree[4]}`;

    e.setAttribute('data-flrn-nid', tree[4]);

    h0e.addEventListener('click', nodeClick);
    //h0e.addEventListener('mouseenter', nodeEnter);
    //h0e.addEventListener('mouseleave', nodeLeave);

    return e;
  };

  // renderers...

  let rs = {};

  rs._children = function(elt, tree) {

//clog('renderChildren()', elt, tree);
    //if ( ! Array.isArray(tree[1])) { render(ce, tree[1]); return elt; }

    let be = elt.querySelector('.flrn-body');
    let ae = create(be, 'div', { class: 'flrn-atts' });
    let ce = create(be, 'div', { class: 'flrn-children' });

    tree[1].forEach(function(t) {
      if (t[0] === '_att') {
        render(ae, t);
      }
      else {
        let e = create(ce, 'div', { class: 'flrn-child' });
        render(e, t);
      }
    });

    //if (ae.childElementCount < 1) elt.removeChild(ae);
    //if (ce.childElementCount < 1) elt.removeChild(ce);

    return elt;
  };

  rs._default = function(elt, tree) {
    let e = createFleuronDiv(elt, tree, '_default');
    return renderChildren(e, tree);
  };

  rs._setter = function(elt, tree) {
    let e = rs._default(elt, tree);
    e.classList.add('flrn-_setter');
    e.querySelector('.flrn-atts').innerHTML = tree[1][0][1][0][0];
    return e;
  }
  rs.set = rs._setter;
  rs.define = rs._setter;

  rs._ = function(elt, tree) {
    let t = '_';
    return create(elt, 'div', { class: 'flrn-_' }, t);
  };
  rs._num = function(elt, tree) {
    let t = '' + tree[1];
    return create(elt, 'div', { class: 'flrn-_num' }, t);
  };
  rs._sqs = function(elt, tree) {
    let t = "'" + tree[1].replaceAll(/'/g, "\'") + "'";
    return create(elt, 'div', { class: 'flrn-_sqs' }, t);
  };
  rs._ref = function(elt, tree) {
    let t = tree[1].map(function(t) { return t[1]; }).join('.');
    return create(elt, 'div', { class: 'flrn-_ref' }, t);
  };

  rs._key = function(elt, tree) {
    let t = tree[0];
    return create(elt, 'div', { class: 'flrn-_att-key' }, t);
  };
  rs._att = function(elt, tree) {
    let e = create(elt, 'div', { class: 'flrn-_att' });
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

  let rws = {};

  rws._if = function(tree) {

    let t0 = tree[0] === '_if' ? 'if' : 'unless';
    let l = tree[2];
    let t = tree[1][1];
    let n = tree[4];

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

  let rewrite = function(tree) {

    let rw = rws[tree[0]];
    let t = rw ? rw(tree) : tree;

    return t;
  };

  // Looks for _fleuron in all parent elements
  //
  let findFleurons = function(elt) {

    if (elt._fleurons) return elt._fleurons;
    if (elt.parentElement) return findFleurons(elt.parentElement);
    return {};
  };

  let getRenderer = function(elt, t0) {

    let fs = findFleurons(elt);

    return fs[t0] || rs[t0] || fs._default || rs._default;
  };

  let renderChildren = function(elt, tree) {

    getRenderer(elt, '_children')(elt, tree);

    let cn = elt.querySelector(':scope > .flrn-body > .flrn-children');
    if (cn && cn.children.length > 0) {
      elt.querySelector('.flrn-head0').classList.add('flrn-collapsable');
    }

    return elt;
  };

  let render = function(elt, tree) {

    let t = rewrite(tree);

    return getRenderer(elt, t[0])(elt, t);
  };

  let nidify = function(t, nid) {

    if ( ! Array.isArray(t)) return;
    if (t.length < 4) { t.push(undefined); } t.push(nid);

    if (Array.isArray(t[1])) t[1].forEach(function(tt, i) {
      nidify(tt, nid + '_' + i);
    });

    return t;
  };

  let locate = function(elt) {

    if (typeof elt === 'string') return document.querySelector(elt);
    return elt;
  };

  let splitClasses = function(kla) {

    let ks = null;

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

    let e = locate(elt);
    let t = nidify(dup(tree), '0');

    clean(e);
    render(e, t, null);
  };

  let addClasses = function(elt, klas) {

    //klas.forEach(function(k) { elt.classList.add(k); });
    elt.classList.add(...klas);
  };

  this.highlight = function(elt, nid, kla, title) {

    let e0 = locate(elt);
    let n = nid.split('-')[0];
    let ks = splitClasses(kla);

    let e = e0.querySelector('[data-flrn-nid="' + n + '"]');
    if ( ! e) return null;

    addClasses(e, ks);

    if (title) {
      e.querySelector('.flrn-head0').title = title;
      e.querySelector('.flrn-tree0').title = title;
    }

    return e;
  };

  this.descend = function(elt, nid, kla) {

    let e0 = locate(elt);
    let n = nid.split('-')[0];
    let ks = splitClasses(kla);

    let e = e0.querySelector('[data-flrn-nid="' + n + '"]');
    if ( ! e) return null;;

    while (true) {
      addClasses(e, ks);
      e = e.parentElement.closest('[data-flrn-nid]'); if ( ! e) break;
    }

    return e;
  };

  this.trail = function(elt, nid, kla, prekla) {

    let e0 = locate(elt);
    let n = nid.split('-')[0];
    let ks = splitClasses(kla);
    let pks = splitClasses(prekla);

    let e = e0.querySelector('[data-flrn-nid="' + n + '"]');
    if ( ! e) return;

    while (true) {

      addClasses(e, ks);

      let pe = e.parentElement.closest('[data-flrn-nid]');

      if ( ! (pe && pe.classList.contains('flrn-_con'))) {

        let seen = false;

        let ce = e.closest('.flrn-child'); while (true) {
          if ( ! ce) break;
          let ee = ce.querySelector('[data-flrn-nid]');
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

    let e0 = locate(elt);
    let n = nid.split('-')[0];

    let ce = e0.querySelector(`[data-flrn-nid="${n}"]`); if ( ! ce) return;

    let v = ce.getAttribute('data-flrn-nids'); v = (v ? (v + ',') : '') + nid;
    ce.setAttribute('data-flrn-nids', v);
  };

  this.collapse = function(/*elt, arguments*/) {

    let as = Array.from(arguments);
    let elt = locate(as.shift());

    as.forEach(function(a, i) {
      let es = null;
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

    let fle = elt.closest('.fleuron');

    fle.querySelectorAll('.flrn-marked')
      .forEach(function(e) { e.classList.remove('flrn-marked'); });
  };

  //
  // done.

  return this;

}).apply({}); // end Fleuron

