import {initQuietMaterial, showSnackbar, closeQuietDialog, setProgress} from './src/quiet-material.js';
import {initMotionStudies} from './demo-motion.js';
import {transitionView, animateMaterial, cancelMotion} from './src/motion.js';

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
  const previous=pages.find(page=>!page.hidden);
  motionStudies?.stopAll();
  const navigationSheet=document.querySelector('#navigation-sheet');
  if(navigationSheet.open)closeQuietDialog(navigationSheet);
  const update=()=>{
    pages.forEach(page=>page.hidden=page!==current);
    if(focus) {window.scrollTo(0,0);const title=current.querySelector('h1');title.tabIndex=-1;title.focus({preventScroll:true});}
  };
  if(focus && previous && previous!==current)transitionView({from:previous,to:current,pattern:'fade-through',update});else update();
  navLinks.forEach(link=>{if(link.hash==='#'+current.id)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  document.querySelector('.more-nav').toggleAttribute('data-current',!['overview','components','motion'].includes(current.id));
  document.title=`${current.id.charAt(0).toUpperCase()+current.id.slice(1)} · Quiet Material`;
}
route();window.addEventListener('hashchange',()=>route(true));
document.addEventListener('click',event=>{const action=event.target.closest('[data-demo-toast]');if(action)showSnackbar(action.dataset.demoToast);});
const search=document.querySelector('#component-search');
const specimens=[...document.querySelectorAll('.specimen')];
const categoryButtons=[...document.querySelectorAll('[data-component-category]')];
const categoryDescriptions={
  actions:'Actions help people move their work forward.',
  communication:'Small signals. Clear feedback. Just enough information.',
  containment:'Group related content and bring supporting details into view.',
  navigation:'A predictable way to move, on every screen.',
  selection:'Make a choice, pick a date, or adjust a setting.',
  'text-inputs':'Make space for a thought, with clear labels and useful feedback.',
  all:'The complete family catalog, ready to explore.',
  extras:'Companion patterns that support the core Material 3 families.'
};
let componentCategory='actions';
function filterComponents() {
  const query=search.value.trim().toLowerCase();let total=0;
  for(const item of specimens) {
    const categoryMatch=query?true:componentCategory==='all'?!!item.dataset.family:item.dataset.category===componentCategory;
    const words=(item.dataset.search+' '+item.querySelector('h2').textContent+' '+(item.dataset.family||'')).toLowerCase();
    item.hidden=!(categoryMatch&&query.split(/\s+/).every(word=>words.includes(word)));
    if(!item.hidden)total++;
  }
  categoryButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.componentCategory===(query?'all':componentCategory))));
  const noun=query?'matching components':componentCategory==='extras'?'companion patterns':'of 36 MD3 families';
  document.querySelector('#component-count').textContent=`${total} ${noun}`;
  document.querySelector('#catalog-context').textContent=query?'Search results across the complete library.':categoryDescriptions[componentCategory];
  document.querySelector('#no-results').hidden=total>0;
}
search.addEventListener('input',filterComponents);
categoryButtons.forEach(button=>button.addEventListener('click',()=>{
  componentCategory=button.dataset.componentCategory;search.value='';filterComponents();
}));
document.querySelector('#clear-component-search').addEventListener('click',()=>{search.value='';componentCategory='all';filterComponents();search.focus();});
filterComponents();
const motionToggle=document.querySelector('#motion-toggle');
const media=window.matchMedia('(prefers-reduced-motion: reduce)');
motionStudies=initMotionStudies(document,{isReduced:()=>media.matches||motionToggle.checked,announce:message=>document.querySelector('#motion-gallery-status').textContent=message});
function updateMotion() {document.documentElement.dataset.qmMotion=motionToggle.checked?'reduced':'full';if(media.matches||motionToggle.checked)motionStudies.stopAll();document.querySelector('#motion-status').textContent=media.matches?'Reduced motion is enabled by your system.':motionToggle.checked?'Reduced motion is enabled for this preview.':'Standard subtle motion is enabled.';}
motionToggle.addEventListener('change',updateMotion);media.addEventListener('change',updateMotion);document.querySelector('#motion-preference-button').addEventListener('click',()=>{motionToggle.checked=!motionToggle.checked;updateMotion();});updateMotion();
document.addEventListener('visibilitychange',()=>{if(document.hidden){motionStudies.stopAll();cancelMotion(document);}});
// Reserve the actual bottom-nav height, including large text and safe-area insets.
if('ResizeObserver' in window)new ResizeObserver(entries=>{
  document.documentElement.style.setProperty('--explorer-nav-height',`${entries[0].target.getBoundingClientRect().height}px`);
}).observe(document.querySelector('.rail'));
const range=document.querySelector('#volume');range.addEventListener('input',()=>{document.querySelector('#volume-value').textContent=range.value+'%';range.setAttribute('aria-valuetext',range.value+' percent');});
document.querySelectorAll('[data-page-number]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-page-number]').forEach(item=>item.removeAttribute('aria-current'));button.setAttribute('aria-current','page');const n=Number(button.dataset.pageNumber);document.querySelector('#pagination-result').textContent=`Showing items ${(n-1)*10+1}-${n*10} of 30.`;}));
const projectForm=document.querySelector('#project-form');const nameInput=document.querySelector('#new-project-name');
nameInput.addEventListener('input',()=>{nameInput.setCustomValidity('');nameInput.removeAttribute('aria-invalid');document.querySelector('#project-name-error').textContent='';});
projectForm.addEventListener('submit',event=>{
  event.preventDefault();const name=nameInput.value.trim();
  if(!name){nameInput.setCustomValidity('Enter a project name.');nameInput.setAttribute('aria-invalid','true');document.querySelector('#project-name-error').textContent='Enter a project name.';nameInput.reportValidity();return;}
  const row=document.createElement('div');row.className='project-row';
  const icon=document.createElement('span');icon.className='project-icon';icon.textContent='✓';
  const content=document.createElement('span');const title=document.createElement('strong');title.textContent=name;const hint=document.createElement('small');hint.textContent='Created in this preview session';content.append(title,hint);row.append(icon,content);document.querySelector('#project-list').append(row);
  closeQuietDialog(document.querySelector('#project-dialog'));projectForm.reset();showSnackbar(`“${name}” created in the workspace.`);
});
document.querySelector('#confirm-delete').addEventListener('click',()=>{closeQuietDialog(document.querySelector('#delete-dialog'));showSnackbar('Confirmation complete. No real data was deleted.');});

const patternSelect=document.querySelector('#transition-pattern');
const axisSelect=document.querySelector('#transition-axis');
const transitionStage=document.querySelector('#transition-stage');
const summaryView=document.querySelector('#transition-summary');
const detailView=document.querySelector('#transition-detail');
const transitionButton=document.querySelector('#play-transition');
let detailVisible=false;
patternSelect.addEventListener('change',()=>{
  cancelMotion(transitionStage);detailVisible=false;summaryView.hidden=false;detailView.hidden=true;
  document.querySelector('#transition-axis-field').hidden=patternSelect.value!=='shared-axis';
  transitionButton.textContent='Show next view';document.querySelector('#transition-status').textContent='Summary view';
});
transitionButton.addEventListener('click',()=>{
  const next=!detailVisible;
  transitionView({from:detailVisible?detailView:summaryView,to:next?detailView:summaryView,
    pattern:patternSelect.value,axis:axisSelect.value,reverse:detailVisible,
    update:()=>{detailVisible=next;summaryView.hidden=next;detailView.hidden=!next;
      transitionButton.textContent=next?'Return to summary':'Show next view';
      document.querySelector('#transition-status').textContent=next?'Detail view':'Summary view';}});
});
let springAtEnd=false;
const springDot=document.querySelector('#spring-dot');
const springTrack=document.querySelector('#spring-track');
const springDestination=()=>springAtEnd?Math.max(0,springTrack.clientWidth-springDot.offsetWidth-24)*(getComputedStyle(springTrack).direction==='rtl'?-1:1):0;
const settleSpringLayout=()=>{cancelMotion(springDot);springDot.style.translate=`${springDestination()}px`;};
if('ResizeObserver' in window)new ResizeObserver(settleSpringLayout).observe(springTrack);
else window.addEventListener('resize',settleSpringLayout);
document.querySelector('#play-spring').addEventListener('click',()=>{
  const dot=springDot;
  const current=Number.parseFloat(getComputedStyle(dot).translate)||0;
  springAtEnd=!springAtEnd;
  const target=springDestination();
  const scheme=document.querySelector('#spring-scheme').value;
  const speed=document.querySelector('#spring-speed').value;
  dot.style.translate=`${target}px`;
  animateMaterial(dot,[{translate:`${current}px`},{translate:`${target}px`}],{scheme,speed,role:'spatial'});
  document.querySelector('#spring-status').textContent=`${scheme==='standard'?'Standard':'Expressive'} · ${speed} spatial spring${media.matches||motionToggle.checked?' · movement reduced':''}.`;
});

// Bind real outcomes to the catalog's reusable controls.
const allExports=document.querySelector('#export-all');
const exportParts=[...document.querySelectorAll('[data-export-part]')];
function updateExportSelection() {
  const selected=exportParts.filter(input=>input.checked).length;
  allExports.checked=selected===exportParts.length;
  allExports.indeterminate=selected>0&&selected<exportParts.length;
}
allExports.addEventListener('change',()=>{exportParts.forEach(input=>input.checked=allExports.checked);updateExportSelection();});
exportParts.forEach(input=>input.addEventListener('change',updateExportSelection));updateExportSelection();
const progressInput=document.querySelector('#demo-progress-value');
progressInput.addEventListener('input',()=>{
  const value=Number(progressInput.value);
  document.querySelector('#demo-progress-output').textContent=`${value}%`;
  document.querySelectorAll('[data-demo-progress]').forEach(element=>setProgress(element,value));
});
document.querySelector('#demo-archive').addEventListener('click',()=>{
  document.querySelector('#snackbar-demo-state').textContent='Your draft is archived.';
  showSnackbar('Draft archived.',{actionLabel:'Undo',onAction(){document.querySelector('#snackbar-demo-state').textContent='Your draft is back in the workspace.';}});
});
const originalChips=[...document.querySelectorAll('#demo-input-chips [data-qm-input-chip]')].map(chip=>chip.cloneNode(true));
document.querySelector('#reset-input-chips').addEventListener('click',event=>{
  document.querySelectorAll('#demo-input-chips [data-qm-input-chip]').forEach(chip=>chip.remove());
  event.currentTarget.before(...originalChips.map(chip=>chip.cloneNode(true)));
});
document.querySelector('#fullscreen-editor-form').addEventListener('submit',event=>{
  event.preventDefault();
  const title=document.querySelector('#editor-title');
  if(!title.value.trim()){title.setCustomValidity('Give your idea a title.');title.reportValidity();return;}
  closeQuietDialog(document.querySelector('#fullscreen-editor'));showSnackbar(`“${title.value.trim()}” saved.`);
});
document.querySelector('#editor-title').addEventListener('input',event=>event.target.setCustomValidity(''));

document.querySelector('#demo-loading-toggle').addEventListener('click',event=>{
  const running=event.currentTarget.getAttribute('aria-pressed')!=='true';
  event.currentTarget.setAttribute('aria-pressed',String(running));
  event.currentTarget.textContent=running?'Stop loading preview':'Start loading preview';
  document.querySelector('#demo-loading-stage').hidden=!running;
  document.querySelector('#demo-loading-status').textContent=running?'Loading preview is active.':'Ready when you are.';
});

// Search examples resolve to the same component catalog they demonstrate.
document.addEventListener('qm:search',event=>{
  const host=event.target.closest('[data-qm-search]');if(!host)return;
  let results=host.querySelector('.demo-search-results');
  if(!results){results=document.createElement('div');results.className='demo-search-results';host.querySelector('.qm-search-view').append(results);}
  results.replaceChildren();
  const query=event.detail.query.toLowerCase();
  const matches=specimens.filter(specimen=>specimen.dataset.family&&(specimen.querySelector('h2').textContent+' '+specimen.dataset.search).toLowerCase().includes(query));
  const message=document.createElement('p');message.className='qm-helper';message.setAttribute('role','status');
  message.textContent=matches.length?`${matches.length} matching component ${matches.length===1?'family':'families'}.`:'No matching component families. Try cards, tabs, or buttons.';results.append(message);
  for(const specimen of matches){
    const result=document.createElement('button');result.type='button';result.className='qm-button qm-button--text';result.textContent=specimen.querySelector('h2').textContent+' →';
    result.addEventListener('click',()=>{
      host.querySelector('button[aria-label="Close search"]')?.click();
      search.value='';componentCategory=specimen.dataset.category;filterComponents();
      const heading=specimen.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});specimen.scrollIntoView({block:'start'});
    });results.append(result);
  }
});

// Showcase page. Every fixture is static markup in index.html: nothing is fetched, scanned, stored or timed.
const showcaseMatches=(text,query)=>query.trim().toLowerCase().split(/\s+/).filter(Boolean).every(word=>text.toLowerCase().includes(word));
const showcaseSingleChoice=(buttons,chosen)=>buttons.forEach(button=>button.setAttribute('aria-pressed',String(button===chosen)));
const showcaseTileSearch=document.querySelector('#showcase-tile-search');
const showcaseTiles=[...document.querySelectorAll('#showcase-tile-grid [data-showcase-tile]')];
function filterShowcaseTiles() {
  let total=0;
  for(const tile of showcaseTiles){tile.hidden=!showcaseMatches(tile.dataset.showcaseTile,showcaseTileSearch.value);if(!tile.hidden)total++;}
  document.querySelector('#showcase-tile-status').textContent=total?`${total} of ${showcaseTiles.length} example tiles shown.`:'No example tile matches that search.';
}
showcaseTileSearch.addEventListener('input',filterShowcaseTiles);
document.querySelector('#showcase-tile-clear').addEventListener('click',()=>{showcaseTileSearch.value='';filterShowcaseTiles();showcaseTileSearch.focus();});
filterShowcaseTiles();

const showcaseDirectorySearch=document.querySelector('#showcase-directory-search');
const showcaseEntries=[...document.querySelectorAll('#showcase-directory-groups [data-showcase-entry]')];
const showcaseGroups=[...document.querySelectorAll('#showcase-directory-groups [data-showcase-group]')];
const showcaseFilters=[...document.querySelectorAll('#showcase-directory-filters [data-showcase-filter]')];
let showcaseCategory='all';
function filterShowcaseDirectory() {
  let total=0;
  for(const entry of showcaseEntries) {
    const inCategory=showcaseCategory==='all'||entry.dataset.showcaseCategory===showcaseCategory;
    entry.hidden=!(inCategory&&showcaseMatches(`${entry.dataset.showcaseEntry} ${entry.dataset.showcaseCategory}`,showcaseDirectorySearch.value));
    if(!entry.hidden)total++;
  }
  for(const group of showcaseGroups)group.hidden=![...group.querySelectorAll('[data-showcase-entry]')].some(entry=>!entry.hidden);
  showcaseFilters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.showcaseFilter===showcaseCategory)));
  document.querySelector('#showcase-directory-status').textContent=`${total} of ${showcaseEntries.length} example entries shown.`;
  document.querySelector('#showcase-directory-empty').hidden=total>0;
}
showcaseDirectorySearch.addEventListener('input',filterShowcaseDirectory);
document.querySelector('#showcase-directory-filters').addEventListener('qm:chip-change',event=>{
  const button=event.target.closest('[data-showcase-filter]');if(!button)return;
  showcaseCategory=button.dataset.showcaseFilter;filterShowcaseDirectory();
});
filterShowcaseDirectory();

const showcaseResultsSearch=document.querySelector('#showcase-results-search');
const showcaseResults=[...document.querySelectorAll('#showcase-results-list [data-showcase-result]')];
function filterShowcaseResults() {
  const query=showcaseResultsSearch.value.trim();let total=0;
  for(const row of showcaseResults){row.hidden=!showcaseMatches(row.dataset.showcaseResult,showcaseResultsSearch.value);if(!row.hidden)total++;}
  document.querySelector('#showcase-results-status').textContent=query?`${total} example ${total===1?'result':'results'} for “${query}”.`:`${showcaseResults.length} example results.`;
  document.querySelector('#showcase-results-empty').hidden=total>0;
}
showcaseResultsSearch.addEventListener('input',filterShowcaseResults);filterShowcaseResults();

const showcaseDays=[...document.querySelectorAll('#showcase-date-strip [data-showcase-day]')];
document.querySelector('#showcase-date-strip').addEventListener('qm:chip-change',event=>{
  const chip=event.target.closest('[data-showcase-day]');if(!chip)return;
  showcaseSingleChoice(showcaseDays,chip);
  document.querySelector('#showcase-date-status').textContent=`${chip.dataset.showcaseDay} chosen in this example.`;
});
document.querySelector('#showcase-text-size').addEventListener('qm:segmented-change',event=>{
  const chosen=event.currentTarget.querySelector('button[aria-checked="true"]');
  document.querySelector('#showcase-text-size-status').textContent=`${chosen?chosen.textContent.trim():event.detail.value} chosen in this example.`;
});
const showcaseShapes=[...document.querySelectorAll('#showcase-shape-row [data-showcase-shape]')];
document.querySelector('#showcase-shape-row').addEventListener('qm:chip-change',event=>{
  const button=event.target.closest('[data-showcase-shape]');if(!button)return;
  showcaseSingleChoice(showcaseShapes,button);
  document.querySelector('#showcase-shape-preview').dataset.showcaseShape=button.dataset.showcaseShape;
  document.querySelector('#showcase-shape-status').textContent=`${button.textContent.trim()} corners chosen in this example.`;
});
// A current row is the graphite container treatment, never the white selection fill.
const showcaseRows=[...document.querySelectorAll('#showcase-section-list [data-showcase-row]')];
showcaseRows.forEach(row=>row.addEventListener('click',()=>{
  showcaseRows.forEach(other=>{if(other===row)other.setAttribute('aria-current','true');else other.removeAttribute('aria-current');});
  document.querySelector('#showcase-section-status').textContent=`${row.dataset.showcaseRow} is the current example row.`;
}));
