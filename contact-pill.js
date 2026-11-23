const contactPill = document.querySelector('.contact-pill');
const wechatButton = contactPill?.querySelector('.pill-wechat');
const wechatDialog = document.getElementById('wechat-contact');
const contactDialog = document.getElementById('dock-contact-value');
let contactTrigger;

if (wechatButton && wechatDialog) {
  wechatButton.addEventListener('click', () => {
    wechatDialog.showModal();
  });
  wechatDialog.addEventListener('close', () => {
    wechatButton.focus({ preventScroll: true });
  });
}

if (contactPill && contactDialog) {
  const title = contactDialog.querySelector('h2');
  const value = contactDialog.querySelector('.contact-value');
  const touchLayout = window.matchMedia('(hover: none)');
  for (const action of contactPill.querySelectorAll('.pill-phone, .pill-email')) {
    action.addEventListener('click', event => {
      if (!touchLayout.matches && event.pointerType !== 'touch') return;
      event.preventDefault();
      contactTrigger = action;
      title.textContent = action.getAttribute('aria-label');
      value.href = action.href;
      value.textContent = action.querySelector('.pill-caption').textContent;
      contactDialog.showModal();
    });
  }
  contactDialog.addEventListener('close', () => {
    contactTrigger?.focus({ preventScroll: true });
  });
}

for (const dialog of [wechatDialog, contactDialog].filter(Boolean)) {
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
}
