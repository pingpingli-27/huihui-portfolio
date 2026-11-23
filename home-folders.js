const folderMotion = matchMedia('(prefers-reduced-motion: reduce)');
let folderPull;

for (const folder of document.querySelectorAll('.desk-files .desk-file')) {
  folder.addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.altKey || event.shiftKey || folderMotion.matches || folder.hasAttribute('download') ||
        (folder.target && folder.target !== '_self')) return;

    const sheet = folder.querySelector('.desk-sheet');
    if (!sheet?.animate) return;
    event.preventDefault();
    if (folderPull) return;

    const slide = sheet.animate([
      { transform: getComputedStyle(sheet).transform },
      { transform: 'translate(-.4%, -4%) rotate(-.25deg)', offset: .24 },
      { transform: 'translate(-1%, -20%) rotate(-1.25deg)' },
    ], {
      duration: 445,
      easing: 'cubic-bezier(.25,.64,.31,1)',
      fill: 'forwards',
    });
    folderPull = { folder, slide };
    folder.classList.add('is-extracting');

    await slide.finished.catch(() => {});
    if (folderPull?.slide === slide) location.assign(folder.href);
  });
}

window.addEventListener('pageshow', () => {
  if (!folderPull) return;
  const { folder, slide } = folderPull;
  folderPull = undefined;
  slide.cancel();
  folder.classList.remove('is-extracting');
});
