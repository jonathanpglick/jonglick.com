document.addEventListener("DOMContentLoaded", main);

function main() {
  hljs.initHighlightingOnLoad();
  hljs.initLineNumbersOnLoad();
  var inlineCodes = toArray(document.querySelectorAll('p code'));
  inlineCodes.forEach(function(inlineCode) {
    hljs.highlightBlock(inlineCode);
  });

  var scroll = window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               function(callback){ window.setTimeout(callback, 1000/60) };

  var lastTop = -1;
  var background1 = document.querySelector('.Layout-background-1');
  var background1Pos = parseInt(getComputedStyle(background1).backgroundPosition.split(' ')[0], 10);
  var background2 = document.querySelector('.Layout-background-2');
  var background2Pos = parseInt(getComputedStyle(background2).backgroundPosition.split(' ')[0], 10);
  function animationLoop() {
    var top = window.pageYOffset;
    if (top != lastTop) {
      background1.style.backgroundPosition = "0 " + (background1Pos + (0.8 * top)) + "px";
      background2.style.backgroundPosition = "" + background2Pos + "px " + (background2Pos + (0.85 * top)) + "px";
    }
    scroll(animationLoop);
  }

  animationLoop();
}

function toArray(a) {
  return Array.prototype.slice.call(a);
}
