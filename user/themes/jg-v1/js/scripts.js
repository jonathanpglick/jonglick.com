document.addEventListener("DOMContentLoaded", main);

function main() {
  hljs.initHighlightingOnLoad();
  hljs.initLineNumbersOnLoad();
  var inlineCodes = toArray(document.querySelectorAll('p code'));
  inlineCodes.forEach(function(inlineCode) {
    hljs.highlightBlock(inlineCode);
  });
}

function toArray(a) {
  return Array.prototype.slice.call(a);
}
