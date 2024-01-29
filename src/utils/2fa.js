import jsSHA from "jssha";
var dec2hex = function (s) {
  return (s < 15.5 ? "0" : "") + Math.round(s).toString(16);
};

var hex2dec = function (s) {
  return parseInt(s, 16);
};

var base32tohex = function (base32) {
  var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  var bits = "";
  var hex = "";

  for (var i = 0; i < base32.length; i++) {
    var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    bits += leftpad(val.toString(2), 5, "0");
  }

  for (i = 0; i + 4 <= bits.length; i += 4) {
    var chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }

  return hex;
};

var leftpad = function (str, len, pad) {
  if (len + 1 >= str.length) {
    str = new Array(len + 1 - str.length).join(pad) + str;
  }
  return str;
};

var generate = function (secret, epoch) {
  var key = base32tohex(secret);

  if (key.length % 2 !== 0) {
    key += "0";
  }
  if (typeof epoch === "undefined") {
    epoch = Math.round(new Date().getTime() / 1000.0);
  }
  var time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, "0");

  // jssha 新版本
  var shaObj = new jsSHA("SHA-1", "HEX");
  shaObj.setHMACKey(key, "HEX");
  shaObj.update(time);
  var hmac = shaObj.getHMAC("HEX");

  // jssha 老版本
  // var hmacObj = new jsSHA(time, "HEX");
  // var hmac = hmacObj.getHMAC(key, "HEX", "SHA-1", "HEX");

  var offset = 0;
  if (hmac !== "KEY MUST BE IN BYTE INCREMENTS") {
    offset = hex2dec(hmac.substring(hmac.length - 1));
  }

  var otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec("7fffffff")) + "";
  return otp.substr(otp.length - 6, 6).toString();
};

export default generate;
