const cover = document.querySelector('.planner-cover');
const inside = document.querySelector('.planner-open');
const scene = document.querySelector('.planner-scene');
const hinge = cover.querySelector('.cover-hinge');
const lining = hinge.querySelector('.cover-lining');
const flat = document.querySelector('.planner-flat');
const openButton = cover.querySelector('.cover-open');
const rightSide = inside.querySelector(':scope > .planner-pages');
const pages = Array.from(rightSide.querySelectorAll('.file-card'));
const backs = pages.map(page => page.querySelector('[data-case-back]').dataset.caseBack);
const pocket = inside.querySelector('.planner-pocket');
const parked = inside.querySelector('.parked-leaf');
const parkedContent = parked.querySelector('.planner-pages');
const picker = document.querySelector('.planner-picker');
const index = Array.from(inside.querySelectorAll('[data-page]'));
const previous = inside.querySelector('[data-step="-1"]');
const next = inside.querySelector('[data-step="1"]');
const count = inside.querySelector('output');
const modeButtons = Array.from(document.querySelectorAll('[data-planner-view]'));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = 0;
let leafTurn;

function copyBack(key) {
  return document.getElementById(key).content.firstElementChild.cloneNode(true);
}

function showLeft(number) {
  const key = backs[number - 1];
  parkedContent.replaceChildren(...(key ? [copyBack(key)] : []));
  parked.hidden = !key;
  pocket.inert = Boolean(key);
  inside.toggleAttribute('data-spread', Boolean(key));
}

function showPage(number) {
  active = number;
  showLeft(active);
  const end = active === pages.length;
  pages.forEach((page, i) => { page.hidden = i !== active; });
  index.forEach((button, i) => {
    if (i === active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  previous.disabled = active === 0;
  next.hidden = end;
  next.disabled = end;
  next.textContent = active === pages.length - 1 ? '翻到背面' : '下一页';
  count.value = end ? `第 ${pages.length} 页背面` : `${active + 1} / ${pages.length}`;
  picker.hidden = inside.hidden || active === 0;
  picker.value = '';
}

function showMode(mode) {
  cover.hidden = mode !== 'closed';
  inside.hidden = mode !== 'open';
  flat.hidden = mode !== 'flat';
  picker.hidden = mode !== 'open' || active === 0;
  modeButtons.forEach(button => {
    button.hidden = mode === 'closed' || button.dataset.plannerView === mode;
  });
  if (mode === 'closed') openButton.focus({preventScroll: true});
  if (mode === 'open') (active ? picker : index[active]).focus({preventScroll: true});
}

function finishPage(number, origin) {
  showPage(number);
  if (origin.hasAttribute('data-case-back')) {
    parkedContent.querySelector('h2').focus({preventScroll: true});
  } else if (origin.disabled) {
    (origin === next ? previous : next).focus({preventScroll: true});
  }
}

function turnPage(number, origin) {
  if (leafTurn || number === active || number < 0 || number > pages.length) return;
  if (reduceMotion.matches || Math.abs(number - active) > 1) {
    finishPage(number, origin);
    return;
  }
  leafTurn = flipLeaf(number, origin);
}

async function flipLeaf(number, origin) {
  const from = pages[active];
  const to = pages[number];
  const forward = number > active;
  const turningIndex = forward ? active : number;
  const moving = document.createElement('div');
  moving.className = 'turning-leaf';
  moving.inert = true;
  moving.setAttribute('aria-hidden', 'true');
  moving.innerHTML = '<div class="turning-face back"><div class="planner-pages"></div></div><div class="turning-face front"><div class="planner-pages"></div></div>';
  const print = pages[turningIndex].cloneNode(true);
  print.hidden = false;
  moving.querySelector('.front .planner-pages').append(print);
  moving.querySelector('.back .planner-pages').append(copyBack(backs[turningIndex]));
  if (!forward) showLeft(number);
  parked.inert = true;
  inside.append(moving);
  inside.dataset.turning = '';
  if (from) {
    from.inert = true;
    from.hidden = forward;
  }
  if (to) {
    to.inert = true;
    to.hidden = !forward;
  }

  const start = document.timeline.currentTime;
  const options = {
    duration: 710, easing: 'cubic-bezier(.39,.03,.4,1)',
    direction: forward ? 'normal' : 'reverse', fill: 'both',
  };
  const animations = [
    moving.animate([
      { transform: 'perspective(14000px) rotateY(0deg)' },
      { transform: 'perspective(14000px) rotateY(-90deg)', offset: .56 },
      { transform: 'perspective(14000px) rotateY(-180deg)' },
    ], options),
    moving.querySelector('.front').animate([
      { opacity: 1 }, { opacity: 1, offset: .556 }, { opacity: 0, offset: .564 }, { opacity: 0 },
    ], options),
    moving.querySelector('.back').animate([
      { opacity: 0 }, { opacity: 0, offset: .556 }, { opacity: 1, offset: .564 }, { opacity: 1 },
    ], options),
  ];
  animations.forEach(animation => { animation.startTime = start; });

  await Promise.all(animations.map(animation => animation.finished));
  moving.remove();
  delete inside.dataset.turning;
  animations.forEach(animation => animation.cancel());
  if (from) from.inert = false;
  if (to) to.inert = false;
  parked.inert = false;
  finishPage(number, origin);
  leafTurn = undefined;
}

async function turnFlatSheet(sheet, toBack) {
  if (sheet.hasAttribute('data-turning')) return;
  const front = sheet.querySelector('.planner-pages');
  const trigger = front.querySelector('[data-case-back]');
  let back = sheet.querySelector('.case-back');
  if (!back) {
    back = copyBack(trigger.dataset.caseBack);
    back.hidden = true;
    const returnButton = document.createElement('button');
    returnButton.type = 'button';
    returnButton.className = 'flat-front';
    returnButton.textContent = '看正面';
    back.append(returnButton);
    sheet.append(back);
  }
  sheet.dataset.turning = '';
  const direction = toBack ? -1 : 1;
  if (!reduceMotion.matches) {
    await sheet.animate([
      {transform: 'perspective(1700px) rotateY(0)'},
      {transform: `perspective(1700px) rotateY(${90 * direction}deg)`},
    ], {duration: 175, easing: 'ease-in', fill: 'forwards'}).finished;
  }

  front.hidden = toBack;
  back.hidden = !toBack;
  if (!reduceMotion.matches) {
    const turnOut = sheet.animate([
      {transform: `perspective(1700px) rotateY(${-90 * direction}deg)`},
      {transform: 'perspective(1700px) rotateY(0)'},
    ], {duration: 230, easing: 'ease-out', fill: 'forwards'});
    await turnOut.finished;
    sheet.getAnimations().forEach(animation => animation.cancel());
  }
  delete sheet.dataset.turning;
  if (!flat.hidden) (toBack ? back.querySelector('h2') : trigger).focus({preventScroll: true});
}

openButton.addEventListener('click', async () => {
  if (openButton.disabled) return;
  openButton.disabled = true;
  if (reduceMotion.matches) {
    showMode('open');
    openButton.disabled = false;
    return;
  }

  scene.dataset.opening = '';
  lining.replaceChildren((parked.hidden ? pocket : parked).cloneNode(true));
  inside.hidden = false;
  inside.inert = true;
  const start = document.timeline.currentTime;
  const animations = [];
  function move(element, frames, timing) {
    const animation = element.animate(frames, { fill: 'both', ...timing });
    animation.startTime = start;
    animations.push(animation);
  }
  move(cover.querySelector('.loose-clip'), [
    { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
    { transform: 'translate(1%, -3%) rotate(-9deg)', opacity: 1, offset: .28 },
    { transform: 'translate(24%, -7%) rotate(21deg)', opacity: 1, offset: .88 },
    { transform: 'translate(27%, -4%) rotate(16deg)', opacity: 0 },
  ], { duration: 690, easing: 'cubic-bezier(.28,.64,.29,1)' });
  move(cover.querySelector('.loose-upper'), [
    { transform: 'translateY(0) scaleX(1)', opacity: 1 },
    { transform: 'translate(-.5%, 3%) rotate(-1.2deg) scaleX(1.015)', opacity: 1, offset: .28 },
    { transform: 'translate(-2%, 20%) rotate(-4.5deg) scaleX(.96)', opacity: .96, offset: .71 },
    { transform: 'translate(-5%, 43%) rotate(-8deg) scaleX(.91)', opacity: 0 },
  ], { delay: 355, duration: 650, easing: 'cubic-bezier(.43,.02,.82,.83)' });
  move(cover.querySelector('.loose-lower'), [
    { transform: 'translateY(0) scaleX(1)', opacity: 1 },
    { transform: 'translate(-1%, 3%) rotate(-2deg) scaleX(1.025)', opacity: 1, offset: .24 },
    { transform: 'translate(-3%, 23%) rotate(-5.7deg) scaleX(.95)', opacity: .94, offset: .69 },
    { transform: 'translate(-7%, 46%) rotate(-11deg) scaleX(.87)', opacity: 0 },
  ], { delay: 430, duration: 660, easing: 'cubic-bezier(.42,.02,.79,.86)' });
  move(inside, [
    { opacity: 0 },
    { opacity: 1 },
  ], { delay: 1310, duration: 190, easing: 'ease-out' });
  const foldTiming = { delay: 1050, duration: 1010, easing: 'linear' };
  move(hinge, [
    { transform: 'translateX(0) perspective(10000px) scaleX(1) rotateY(0deg)', easing: 'cubic-bezier(.28,.23,.25,1)' },
    { transform: 'translateX(50.4%) perspective(10000px) scaleX(.486) rotateY(0deg)', offset: .28, easing: 'cubic-bezier(.35,.05,.41,.95)' },
    { transform: 'translateX(50.4%) perspective(10000px) scaleX(.504) rotateY(-90deg)', offset: .61, easing: 'cubic-bezier(.24,.14,.28,1)' },
    { transform: 'translateX(50.4%) perspective(10000px) scaleX(.504) rotateY(-180deg)' },
  ], foldTiming);
  // Switch surfaces at the edge-on position to keep the cover lettering from mirroring.
  move(hinge.querySelector('.cover-front-face'), [
    { opacity: 1 }, { opacity: 1, offset: .609 }, { opacity: 0, offset: .611 }, { opacity: 0 },
  ], foldTiming);
  move(hinge.querySelector('.cover-back-face'), [
    { opacity: 0 }, { opacity: 0, offset: .609 }, { opacity: 1, offset: .611 }, { opacity: 1 },
  ], foldTiming);

  await Promise.all(animations.map(animation => animation.finished));
  inside.inert = false;
  showMode('open');
  delete scene.dataset.opening;
  for (const animation of animations) animation.cancel();
  lining.replaceChildren();
  openButton.disabled = false;
});
modeButtons.forEach(button => button.addEventListener('click', async () => {
  await leafTurn;
  showMode(button.dataset.plannerView);
}));
index.forEach(button => button.addEventListener('click', () => turnPage(Number(button.dataset.page), button)));
picker.addEventListener('change', () => turnPage(Number(picker.value), picker));
previous.addEventListener('click', () => turnPage(active - 1, previous));
next.addEventListener('click', () => turnPage(active + 1, next));
rightSide.addEventListener('click', event => {
  const button = event.target.closest('[data-case-back]');
  if (button) turnPage(active + 1, button);
});
flat.addEventListener('click', event => {
  const button = event.target.closest('[data-case-back], .flat-front');
  if (button) turnFlatSheet(button.closest('.flat-sheet'), button.hasAttribute('data-case-back'));
});
showPage(0);
