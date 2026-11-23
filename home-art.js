const artIndex = document.querySelector('.art-index');
const artCards = [...artIndex.querySelectorAll('[data-art]')];
const artBySlug = new Map(artCards.map((card, index) => [card.dataset.art, index]));
const artViewer = document.querySelector('#art-viewer');
const artImage = artViewer.querySelector('#art-viewer-image');
const artTitle = artViewer.querySelector('#art-viewer-title');
const artPosition = artViewer.querySelector('.art-viewer-position');
let artTrigger;
let activeArt = 0;

function displayArt(index) {
  activeArt = (index + artCards.length) % artCards.length;
  const card = artCards[activeArt];
  const original = card.querySelector('img');
  artImage.src = original.dataset.src;
  artImage.alt = original.alt;
  artTitle.textContent = card.querySelector('.art-caption').textContent;
  artPosition.textContent = `${activeArt + 1} / ${artCards.length}`;
}

artIndex.addEventListener('toggle', () => {
  if (!artIndex.open) return;
  for (const card of artCards) {
    const image = card.querySelector('img');
    if (!image.hasAttribute('src')) image.src = image.dataset.src;
  }
});

for (const card of document.querySelectorAll('[data-art]')) {
  card.addEventListener('click', () => {
    artTrigger = card;
    displayArt(artBySlug.get(card.dataset.art));
    artViewer.showModal();
  });
}

for (const control of artViewer.querySelectorAll('[data-art-shift]')) {
  control.addEventListener('click', () => displayArt(activeArt + Number(control.dataset.artShift)));
}

artViewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    displayArt(activeArt + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});
artViewer.querySelector('.art-viewer-close').addEventListener('click', () => artViewer.close());
artViewer.addEventListener('close', () => artTrigger?.focus({ preventScroll: true }));
