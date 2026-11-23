for (const button of document.querySelectorAll('[data-case-dialog]')) {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.caseDialog).showModal();
  });
}
