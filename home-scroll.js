const badgeDialog = document.querySelector('.badge-dialog');
let trigger;
let extractingBadge;

async function pullBadgeFrom(board, card) {
  const initialOffset = getComputedStyle(card).translate;
  const distance = board.getBoundingClientRect().width * .22;
  board.dataset.pulling = '';
  const slide = card.animate([
    { translate: initialOffset === 'none' ? '0px 0px' : initialOffset },
    { translate: `${distance}px ${-distance / Math.tan(42 * Math.PI / 180)}px` },
  ], { duration: 440, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });

  await slide.finished;
  board.dataset.extracted = '';
  badgeDialog.showModal();
  slide.cancel();
}

for (const button of document.querySelectorAll('[data-contact]')) {
  button.addEventListener('click', async () => {
    if (extractingBadge || badgeDialog.open) return;
    trigger = button;

    const board = button.closest('.bio-board');
    const card = board?.querySelector('.badge-peek');
    if (!card || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      badgeDialog.showModal();
      return;
    }

    extractingBadge = board;
    try {
      await pullBadgeFrom(board, card);
    } catch {
      delete board.dataset.pulling;
      delete board.dataset.extracted;
      badgeDialog.showModal();
    } finally {
      extractingBadge = undefined;
    }
  });
}

badgeDialog.querySelector('.close').addEventListener('click', () => badgeDialog.close());
badgeDialog.addEventListener('close', () => {
  const board = trigger?.closest('.bio-board');
  if (board) {
    delete board.dataset.pulling;
    delete board.dataset.extracted;
  }
  trigger?.focus({ preventScroll: true });
});
