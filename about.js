const card = document.querySelector('#contact-card');
let opener;

for (const trigger of document.querySelectorAll('[data-contact]')) {
  trigger.addEventListener('click', () => {
    if (card.open) return;
    opener = trigger;
    card.showModal();
  });
}

card.querySelector('.badge-close').addEventListener('click', () => card.close());
card.addEventListener('click', (event) => {
  if (event.target !== card) return;
  const rect = card.getBoundingClientRect();
  const isOutside = event.clientX < rect.left || event.clientX > rect.right ||
    event.clientY < rect.top || event.clientY > rect.bottom;
  if (isOutside) card.close();
});
card.addEventListener('close', () => opener?.focus({ preventScroll: true }));
