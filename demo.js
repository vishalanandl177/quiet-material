import {initQuietMaterial, showSnackbar} from './src/quiet-material.js';
import {initMotionStudies} from './demo-motion.js';

// Capture small copyable examples before interactive state is added.
for (const specimen of document.querySelectorAll('.specimen')) {
  const preview=specimen.querySelector('.specimen-preview');
  const details=document.createElement('details');details.className='markup';
  const summary=document.createElement('summary');summary.textContent='View markup';
  const pre=document.createElement('pre');const code=document.createElement('code');
  code.textContent=preview.innerHTML.trim();pre.append(code);details.append(summary,pre);specimen.append(details);
}
initQuietMaterial(document);
const pages=[...document.querySelectorAll('.page')];
const navLinks=[...document.querySelectorAll('.main-nav a, .more-links a')];
let motionStudies;
function route(focus=false) {
  const requested=location.hash.slice(1);
  // The skip-link target must remain a focus destination, not a route.
  if(requested==='content' && pages.some(page=>page.hidden)) {document.querySelector('main').focus();return;}
  const current=pages.find(page=>page.id===requested)||pages[0];
  motionStudies?.stopAll();
  const navigationSheet=document.querySelector('#navigation-sheet');
  if(navigationSheet.open)navigationSheet.close();
  pages.forEach(page=>page.hidden=page!==current);
  navLinks.forEach(link=>{if(link.hash==='#'+current.id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  document.querySelector('.more-nav').toggleAttribute('data-current',!['overview','components','motion'].includes(current.id));
  document.title=`${current.id.charAt(0).toUpperCase()+current.id.slice(1)} · Quiet Material`;
  if(focus) {window.scrollTo(0,0);const title=current.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});}
}
route();window.addEventListener('hashchange',()=>route(true));
document.addEventListener('click',event=>{const action=event.target.closest('[data-demo-toast]');if(action)showSnackbar(action.dataset.demoToast);});
const search=document.querySelector('#component-search');const specimens=[...document.querySelectorAll('.specimen')];
function filterComponents() {const query=search.value.trim().toLowerCase();let total=0;for(const item of specimens){item.hidden=!(item.dataset.search+' '+item.querySelector('h2').textContent).toLowerCase().includes(query);if(!item.hidden)total++;}document.querySelector('#component-count').textContent=`${total} of ${specimens.length} components`;document.querySelector('#no-results').hidden=total>0;}
search.addEventListener('input',filterComponents);filterComponents();
const motionToggle=document.querySelector('#motion-toggle');
const media=window.matchMedia('(prefers-reduced-motion: reduce)');
motionStudies=initMotionStudies(document,{isReduced:()=>media.matches||motionToggle.checked,announce:message=>document.querySelector('#motion-gallery-status').textContent=message});
function updateMotion() {document.documentElement.dataset.qmMotion=motionToggle.checked?'reduced':'full';if(media.matches||motionToggle.checked)motionStudies.stopAll();document.querySelector('#motion-status').textContent=media.matches?'Reduced motion is enabled by your system.':motionToggle.checked?'Reduced motion is enabled for this preview.':'Standard subtle motion is enabled.';}
motionToggle.addEventListener('change',updateMotion);media.addEventListener('change',updateMotion);document.querySelector('#motion-preference-button').addEventListener('click',()=>{motionToggle.checked=!motionToggle.checked;updateMotion();});updateMotion();
document.addEventListener('visibilitychange',()=>{if(document.hidden)motionStudies.stopAll();});
// Reserve the actual bottom-nav height, including large text and safe-area insets.
if('ResizeObserver' in window)new ResizeObserver(entries=>{
  document.documentElement.style.setProperty('--explorer-nav-height',`${entries[0].target.getBoundingClientRect().height}px`);
}).observe(document.querySelector('.rail'));
const range=document.querySelector('#volume');range.addEventListener('input',()=>{document.querySelector('#volume-value').textContent=range.value+'%';range.setAttribute('aria-valuetext',range.value+' percent');});
document.querySelectorAll('[data-page-number]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-page-number]').forEach(item=>item.removeAttribute('aria-current'));button.setAttribute('aria-current','page');const n=Number(button.dataset.pageNumber);document.querySelector('#pagination-result').textContent=`Showing items ${(n-1)*10+1}–${n*10} of 30.`;}));
const projectForm=document.querySelector('#project-form');const nameInput=document.querySelector('#new-project-name');
nameInput.addEventListener('input',()=>{nameInput.setCustomValidity('');nameInput.removeAttribute('aria-invalid');document.querySelector('#project-name-error').textContent='';});
projectForm.addEventListener('submit',event=>{
  event.preventDefault();const name=nameInput.value.trim();
  if(!name){nameInput.setCustomValidity('Enter a project name.');nameInput.setAttribute('aria-invalid','true');document.querySelector('#project-name-error').textContent='Enter a project name.';nameInput.reportValidity();return;}
  const row=document.createElement('div');row.className='project-row';
  const icon=document.createElement('span');icon.className='project-icon';icon.textContent='✓';
  const content=document.createElement('span');const title=document.createElement('strong');title.textContent=name;const hint=document.createElement('small');hint.textContent='Created in this preview session';content.append(title,hint);row.append(icon,content);document.querySelector('#project-list').append(row);
  document.querySelector('#project-dialog').close();projectForm.reset();showSnackbar(`“${name}” created in the workspace.`);
});
document.querySelector('#confirm-delete').addEventListener('click',()=>{document.querySelector('#delete-dialog').close();showSnackbar('Confirmation complete. No real data was deleted.');});
