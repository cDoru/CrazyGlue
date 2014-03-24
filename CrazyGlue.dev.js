/* jshint jquery, strict: true */
/* global $ */

/**
 * Bi-directional binding between this JS object and a DOM tag.
 * Easy to customize. Depends on DOM 'change' event.
 * @param {*} $el is a jQuery $el collection, or a selector string.
 *   $('input[name=xxx]')
 *   $('select[name=xxx]')
 *   $('input[name=xxx]:radio')
 *   $('input[name=xxx]:checkbox')
 * @param {*} value to set tag to. string, array, null. optional.
 * @param {function} changeCb callback when tag's value changes. optional.
 * @returns {CrazyGlue}
 *   .value             current tag value.
 *   .change(newValue)  changes tag value.
 *   .sync()            forces .value to current tag value
 * @constructor
 */

var CrazyGlue = function CrazyGlue ($el, value, changeCb) {
  console.log('~~~ bind2Way.CrazyGlue constructor. typeof $el=', typeof $el);
  if (!this instanceof CrazyGlue) {
    return new CrazyGlue($el, value, changeCb);
  }
  if (typeof value === 'function') {
    changeCb = value;
    value = undefined;
  }

  this.$el = typeof $el === 'string' ? $($el) : $el;
  console.log('$el=', this.$el);

  var getPut = this._gettersPutters(this.$el);
  this._getJsValue = getPut[0];
  this._putToDom = getPut[1];

  console.log('~~~ CrazyGlue. called value=', value);
  if (typeof value !== 'undefined') { this._putToDom(value); }
  this.value = this._getJsValue(); // get what's really in the DOM
  console.log('~~~ CrazyGlue. stored value=', this.value);
  this.changeCb = typeof changeCb === 'function' ? changeCb : undefined;

  // Use non-jQuery event handler so it can refer to our props as 'this'.
  // Checkboxes & radio buttons have $el.length > 1, others $el.length = 1
  for (var i = 0, len = this.$el.length; i < len; i += 1) {
    this.$el[i].addEventListener('change', this, false);
  }
};

CrazyGlue.prototype._gettersPutters = function _gettersPutters ($el) {
  var tag = $el.prop('tagName');

  if (tag === 'INPUT') {
    var type = $el.prop('type');
    if (type === 'checkbox' || type === 'radio') {
      console.log('~~~ INPUT:' + type);
      return [this._getElChecked, this._putElChecked];
    }
  } else if (tag === 'SELECT') {
    console.log('~~~ SELECT');
    return [this._getElSelected, this._putElSelected];
  }

  console.log('~~~ TAG regular');
  return [this._getElValue, this._putElValue];
};

CrazyGlue.prototype._getElValue = function () {
  var val = this.$el.val(),
    type = typeof val;

  if (type === 'undefined' || type === 'null') { val = ''; }

  console.log('~~~~~ CrazyGlue.getElValue=', val);
  return val;
};

CrazyGlue.prototype._getElChecked = function () {
  var val = this.$el.filter(':checked').val(),
    type = typeof val;

  if (type === 'undefined' || type === 'null') { val = []; }
  if (type === 'string') { val = [val]; }

  console.log('~~~~~ CrazyGlue.getElChecked=', val);
  return val;
};

CrazyGlue.prototype._getElSelected = function () {
  var val = this.$el.val(),
    type = typeof val;

  if (type === 'undefined' || type === 'null') { val = []; }

  console.log('~~~~~ CrazyGlue.getElSelected=', val);
  return val;
};

CrazyGlue.prototype._putElValue = function (value) {
  console.log('~~~~~ CrazyGlue.putElValue=', value);
  var val = value,
    type = typeof val;

  if (type === 'undefined' || type === 'null') { val = ''; }

  this.$el.val(val);
};

CrazyGlue.prototype._putElChecked = function (value) {
  console.log('~~~~~ CrazyGlue.putElChecked=', value);
  var val = value,
    type = typeof val;

  if (type === 'undefined' || type === 'null') { val = []; }
  if (type === 'string') { val = [val]; }

  this.$el.removeAttr('checked'); // req'd for checkboxes
  this.$el.val(val);
};

CrazyGlue.prototype._putElSelected = function (value) {
  console.log('~~~~~ CrazyGlue.putElSelected=', value);
  var val = value,
    type = typeof val;

  if (type === 'undefined' || type === 'null') { val = []; }
  if (type === 'string') { val = [val]; }

  this.$el.val(val);
};

CrazyGlue.prototype.handleEvent = function handleEvent (event) {
  console.log('~~~ CrazyGlue.handleEvent. type=', event.type);
  switch (event.type) {
    case "change":
      this.value = this._getJsValue();
      if (this.changeCb) { this.changeCb(this.value); }
  }
};

CrazyGlue.prototype.change = function change (value) {
  console.log('~~~ CrazyGlue.change');

  this._putToDom(value);
  this.value = this._getJsValue(); // get what's really in the DOM
};

CrazyGlue.prototype.sync = function sync () {
  console.log('~~~ CrazyGlue.force');

  this.value = this._getJsValue();
};