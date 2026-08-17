(function () {
  const screens = {
    start: document.getElementById("screen-start"),
    sort: document.getElementById("screen-sort"),
    results: document.getElementById("screen-results"),
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("hidden", key !== name);
    });
  }

  function showFatalError(message) {
    screens.start.innerHTML =
      '<p class="lede">' + message + "</p>";
    showScreen("start");
  }

  if (typeof CHARACTERS === "undefined" || CHARACTERS.length < 2) {
    showFatalError(
      "No characters found. Add images to the images/ folder and run " +
        "node generate-list.js, then reload."
    );
    return;
  }

  const startCountEl = document.getElementById("start-count");
  startCountEl.textContent =
    CHARACTERS.length +
    " characters \u2022 about " +
    estimateComparisons(CHARACTERS.length) +
    " comparisons";

  const cardA = document.getElementById("card-a");
  const cardB = document.getElementById("card-b");
  const imgA = document.getElementById("img-a");
  const imgB = document.getElementById("img-b");
  const nameA = document.getElementById("name-a");
  const nameB = document.getElementById("name-b");
  const progressCount = document.getElementById("progress-count");
  const progressBarFill = document.getElementById("progress-bar-fill");
  const visionFill = document.getElementById("vision-fill");
  const resultsList = document.getElementById("results-list");
  const vizCaption = document.getElementById("viz-caption");
  const arrayViz = document.getElementById("array-viz");

  let generator = null;
  let currentPair = null; // { a, b } indices into CHARACTERS
  let totalEstimate = 0;
  let comparisonsDone = 0;

  function begin() {
    generator = binaryInsertionSort(CHARACTERS);
    totalEstimate = estimateComparisons(CHARACTERS.length);
    comparisonsDone = 0;
    updateProgress();
    showScreen("sort");
    advance(generator.next());
  }

  function updateProgress() {
    const pct = totalEstimate > 0 ? Math.min(comparisonsDone / totalEstimate, 1) : 0;
    progressCount.textContent = comparisonsDone + " / ~" + totalEstimate;
    progressBarFill.style.width = pct * 100 + "%";
    visionFill.style.transform = "scaleY(" + pct + ")";
  }

  function advance(step) {
    if (step.done) {
      progressCount.textContent = comparisonsDone + " / " + comparisonsDone;
      progressBarFill.style.width = "100%";
      visionFill.style.transform = "scaleY(1)";
      renderResults(step.value);
      return;
    }
    currentPair = step.value;
    const charA = CHARACTERS[currentPair.a];
    const charB = CHARACTERS[currentPair.b];
    imgA.src = charA.file;
    imgA.alt = charA.name;
    nameA.textContent = charA.name;
    imgB.src = charB.file;
    imgB.alt = charB.name;
    nameB.textContent = charB.name;
    renderArrayViz(currentPair);
  }

  function renderArrayViz(state) {
    const sortedLen = state.sortedOrder.length;
    arrayViz.innerHTML = "";
    for (let i = 0; i < state.totalCount; i++) {
      const slot = document.createElement("span");
      slot.className = "array-slot";
      if (i < sortedLen) {
        slot.classList.add("sorted");
        if (i >= state.lo && i < state.hi) slot.classList.add("window");
        if (i === state.mid) slot.classList.add("mid");
        slot.title = CHARACTERS[state.sortedOrder[i]].name;
      } else {
        slot.classList.add("queued");
      }
      arrayViz.appendChild(slot);
    }

    const rangeSize = state.hi - state.lo;
    vizCaption.textContent =
      "Placing " +
      CHARACTERS[state.insertingIndex].name +
      " \u2014 narrowing to " +
      rangeSize +
      (rangeSize === 1 ? " possible spot" : " possible spots") +
      " among your top " +
      sortedLen;
  }

  function choose(preferA) {
    if (!currentPair) return;
    comparisonsDone++;
    updateProgress();
    advance(generator.next(preferA));
  }

  function renderResults(order) {
    resultsList.innerHTML = "";
    order.forEach((charIndex, i) => {
      const char = CHARACTERS[charIndex];
      const li = document.createElement("li");

      const rank = document.createElement("span");
      rank.className = "rank";
      rank.textContent = "#" + (i + 1);

      const img = document.createElement("img");
      img.src = char.file;
      img.alt = "";

      const name = document.createElement("span");
      name.className = "name";
      name.textContent = char.name;

      li.append(rank, img, name);
      resultsList.appendChild(li);
    });
    showScreen("results");
  }

  document.getElementById("start-button").addEventListener("click", begin);
  cardA.addEventListener("click", () => choose(true));
  cardB.addEventListener("click", () => choose(false));

  document.addEventListener("keydown", (e) => {
    if (screens.sort.classList.contains("hidden")) return;
    if (e.key === "ArrowLeft") choose(true);
    if (e.key === "ArrowRight") choose(false);
  });

  document.getElementById("restart-button").addEventListener("click", () => {
    showScreen("start");
  });

  document.getElementById("copy-button").addEventListener("click", async () => {
    const lines = Array.from(resultsList.children).map(
      (li) => li.querySelector(".name").textContent
    );
    const text = lines.join("\n");
    const button = document.getElementById("copy-button");
    try {
      await navigator.clipboard.writeText(text);
      const original = button.textContent;
      button.textContent = "Copied!";
      setTimeout(() => (button.textContent = original), 1500);
    } catch (err) {
      button.textContent = "Copy failed \u2014 select text manually";
    }
  });
})();
