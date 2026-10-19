/* P.S. Lab v3.2: the roulette parts shared by No. 03 Six in a row and No. 39 The covered ladder, moved verbatim
   from No. 03's block in experiments.html (Rev 047). Both machines load this first (data-needs="roulette"). */
(function () {
  'use strict';
  var RL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  var RL_RED = {1:1,3:1,5:1,7:1,9:1,12:1,14:1,16:1,18:1,19:1,21:1,23:1,25:1,27:1,30:1,32:1,34:1,36:1};
  function rlColorOf(n) { return n === 0 ? 'g' : (RL_RED[n] ? 'r' : 'b'); }
  function rlOpp(k) { return k === 'r' ? 'b' : k === 'b' ? 'r' : k === 'o' ? 'e' : 'o'; }
  function rlWord(k) { return k === 'r' ? 'RED' : k === 'b' ? 'BLACK' : k === 'o' ? 'ODD' : 'EVEN'; }
  function rlFmt(n) { return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US'); }
  window.LAB_RL = { RL_ORDER: RL_ORDER, RL_RED: RL_RED, rlColorOf: rlColorOf, rlOpp: rlOpp, rlWord: rlWord, rlFmt: rlFmt };
})();
