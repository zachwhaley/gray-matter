'use strict';

var fs = require('fs');
var YAML = require('js-yaml');
var delims = require('delimiter-regex');
var extend = require('extend-shallow');
var parsers = require('../../lib/parsers');

module.exports = matter;

function matter(str, options) {
  if (str.length === 0) {
    return {orig: '', data: {}, content: ''};
  }

  if (str.charCodeAt(0) === 65279 && str.charCodeAt(1) === 116 && str.charCodeAt(2) === 104) {
    str = str.slice(1);
  }

  var opts = extend({}, options);
  if (str.slice(0, 3) !== '---') {
    return {orig: str, data: {}, content: str};
  }

  var delimiters = delims(['---([^\\n]*)', '---\s*([\\s\\S]*)']);
  var file = str.match(delimiters);
  var res = {orig: str, data: {}, content: str};

  if (file) {
    var lang = (file[1] !== '' ? file[1].trim() : opts.lang) || 'yaml';
    try {
      res.data = parsers[lang](file[2].trim(), opts);
    } catch (err) {
      err.origin = __filename;
      console.log('Front-matter language not detected by gray-matter', err);
    }
    res.content = file[3].trim();
  }

  return res;
}

matter.read = function(fp, opts) {
  var str = fs.readFileSync(fp, 'utf8');
  var obj = matter(str, opts);
  return extend(obj, {
    path: fp
  });
};

