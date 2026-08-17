// Resumable binary-insertion sort.
//
// Why a generator: the comparator here is a human clicking a button, not a
// function that returns instantly. A generator lets the sort logic `yield`
// a pair to compare and pause execution until the caller calls .next(result)
// with the user's choice — no manual state machine needed.
//
// preferredIsA / preferredIsB: pass true for whichever the user picked.
// The generator yields { a, b } (indices into `items`) and expects the
// caller's next .next(...) call to pass `true` if `a` was preferred, or
// `false` if `b` was preferred.

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function estimateComparisons(n) {
  // Sum over each insertion of ceil(log2(sortedLengthSoFar + 1)), which is
  // what binary insertion actually costs. Used only for the progress bar.
  let total = 0;
  for (let sortedLen = 1; sortedLen < n; sortedLen++) {
    total += Math.ceil(Math.log2(sortedLen + 1));
  }
  return total;
}

// order: array of original indices, ranked best (index 0) to worst.
function* binaryInsertionSort(items) {
  const order = shuffle(items.map((_, i) => i));
  const sorted = [order[0]];

  for (let k = 1; k < order.length; k++) {
    const itemIndex = order[k];
    let lo = 0;
    let hi = sorted.length;

    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      // Ask: is itemIndex preferred over sorted[mid]?
      const preferNew = yield { a: itemIndex, b: sorted[mid] };
      if (preferNew) {
        hi = mid;
      } else {
        lo = mid + 1;
      }
    }
    sorted.splice(lo, 0, itemIndex);
  }

  return sorted;
}

if (typeof module !== "undefined") {
  module.exports = { binaryInsertionSort, estimateComparisons, shuffle };
}
