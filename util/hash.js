
module.exports = {
 hash: function hash(url) {
     var hash = 0, i, chr;
     if (url.length === 0) return hash;
     for (i = 0; i < url.length; i++) {
         chr   = url.charCodeAt(i);
         hash  = ((hash << 5) - hash) + chr;
         hash |= 0;
     }
     return hash;
 }
};