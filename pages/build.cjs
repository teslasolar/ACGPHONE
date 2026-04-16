#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const IDX = path.join(__dirname, 'index');
const OUT = path.join(__dirname, 'index.html');

function loadJson(fp) { return JSON.parse(fs.readFileSync(fp, 'utf8')); }
function loadHtml(fp) { return fs.readFileSync(fp, 'utf8'); }
function fill(tpl, vars) {
  return tpl.replace(/\{\{(\w[\w.]*)\}\}/g, (_, k) => {
    const parts = k.split('.');
    let v = vars;
    for (const p of parts) { v = v?.[p]; }
    return v ?? '';
  });
}

// Load all tag instances from a subdirectory
function loadDir(dir) {
  const items = [];
  if (!fs.existsSync(dir)) return items;
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('_') || !f.endsWith('.json')) continue;
    items.push(loadJson(path.join(dir, f)));
  }
  return items;
}

// Load UDT templates for a directory
function loadTemplates(dir) {
  const tp = path.join(dir, '_templates.json');
  if (!fs.existsSync(tp)) return {};
  return loadJson(tp).udt || {};
}

// --- Data ---
const stages = loadDir(path.join(IDX, 'stages'));
const stageOrder = ['red','orange','yellow','green','blue','purple','white'];
stages.sort((a, b) => stageOrder.indexOf(a.id) - stageOrder.indexOf(b.id));
const stageMap = Object.fromEntries(stages.map(s => [s.id, s]));

const cards = loadDir(path.join(IDX, 'cards'));
const users = loadDir(path.join(IDX, 'users'));
const userMap = Object.fromEntries(users.map(u => [u.id, u]));

const headerData = loadJson(path.join(IDX, 'header.json'));
const cycleData = loadJson(path.join(IDX, 'cycle.json'));
const chatData = loadJson(path.join(IDX, 'chat.json'));
const css = fs.readFileSync(path.join(IDX, 'styles', 'base.css'), 'utf8');

// --- Templates ---
const layoutTpl = loadHtml(path.join(IDX, 'layout.html'));
const headerTpl = loadHtml(path.join(IDX, 'header.html'));
const cycleTpl = loadHtml(path.join(IDX, 'cycle.html'));
const boardTpl = loadHtml(path.join(IDX, 'board.html'));
const columnTpl = loadHtml(path.join(IDX, 'column.html'));
const cardTpl = loadHtml(path.join(IDX, 'card.html'));
const chatTpl = loadHtml(path.join(IDX, 'chat.html'));

// --- Render ---

// Header: chain users
const chainUsersHtml = headerData.chain.users.map((uid, i, arr) => {
  const u = userMap[uid];
  if (!u) return '';
  const arrow = i < arr.length - 1 ? '<span class="chain-arrow">→</span>' : '';
  return `<span class="chain-user-badge">` +
    `<span class="user-dot" style="background:${u.color}"></span>` +
    `${u.name}${arrow}</span>`;
}).join('');

const headerHtml = fill(headerTpl, {
  ...headerData,
  chain_users: chainUsersHtml,
  'chain.name': headerData.chain.name,
});

// Cycle
const stageDots = stages.map((s, i) => {
  const arrow = i < stages.length - 1 ? '<span class="cycle-arrow">→</span>' : '';
  return `<span class="cycle-dot" style="background:${s.color}" title="${s.name}">${s.icon}</span>${arrow}`;
}).join('');
const cycleHtml = fill(cycleTpl, {
  stage_dots: stageDots,
  first_color: stages[0].color,
});

// Cards grouped by stage
function nextStage(id) {
  const i = stageOrder.indexOf(id);
  return stageOrder[(i + 1) % stageOrder.length];
}

function renderCard(c) {
  const s = stageMap[c.stage];
  const ns = stageMap[nextStage(c.stage)];
  const u = userMap[c.createdBy] || { name: '?', color: '#666' };
  const tagDots = (c.tags || []).map(t => {
    const ts = stageMap[t];
    return ts ? `<span class="card-tag" style="background:${ts.color}"></span>` : '';
  }).join('');
  return fill(cardTpl, {
    id: c.id,
    title: c.title,
    description: c.description || '',
    color: s.color,
    tag_dots: tagDots,
    user_color: u.color,
    user_name: u.name,
    next_name: ns.name,
  });
}

// Columns
const columnsHtml = stages.map((s, i) => {
  const ns = stages[(i + 1) % stages.length];
  const stageCards = cards.filter(c => c.stage === s.id);
  const cardsHtml = stageCards.map(renderCard).join('\n');
  const addBtn = s.id === 'red'
    ? `<div class="add-card-area"><button class="btn btn-add" onclick="showAdd()">+ Add Question</button></div>`
    : '';
  return fill(columnTpl, {
    id: s.id,
    color: s.color,
    icon: s.icon,
    name: s.name,
    count: stageCards.length,
    emoji: s.emoji,
    next_emoji: ns.emoji,
    cards: cardsHtml,
    add_btn: addBtn,
  });
}).join('\n');

const boardHtml = fill(boardTpl, { columns: columnsHtml });

// Chat
const msgsHtml = chatData.messages.map(m => {
  const u = userMap[m.user] || { name: '?', color: '#666' };
  return `<div class="chat-msg"><div class="chat-msg-header">` +
    `<span class="user-dot" style="background:${u.color}"></span>` +
    `<span class="chat-msg-name">${u.name}</span></div>` +
    `<p class="chat-msg-text">${m.text}</p></div>`;
}).join('\n');
const chatHtml = fill(chatTpl, { messages: msgsHtml, hint: chatData.hint });

// Inline JS for interactivity
const script = `
var STAGES=${JSON.stringify(stageOrder)};
var STAGE_DATA=${JSON.stringify(stageMap)};
function ev(e){e.preventDefault();e.currentTarget.classList.add('drag-over')}
function el(e){e.currentTarget.classList.remove('drag-over')}
function dp(e){e.preventDefault();e.currentTarget.classList.remove('drag-over');
var id=e.dataTransfer.getData('text/plain');var card=document.querySelector('[data-id="'+id+'"]');
if(card){e.currentTarget.querySelector('.stage-cards').appendChild(card);
var st=e.currentTarget.dataset.stage;var s=STAGE_DATA[st];
card.style.borderLeftColor=s.color;card.dataset.stage=st;updateCounts()}}
function ds(e){e.dataTransfer.setData('text/plain',e.currentTarget.dataset.id);
e.dataTransfer.effectAllowed='move'}
function toggle(id){var el=document.getElementById('ex-'+id);
var exp=el.parentElement.querySelector('.card-expand');
if(el.hidden){el.hidden=false;exp.textContent='▾'}else{el.hidden=true;exp.textContent='▸'}}
function advance(id){var card=document.querySelector('[data-id="'+id+'"]');
var col=card.closest('.stage-column');var cur=col.dataset.stage;
var ni=(STAGES.indexOf(cur)+1)%STAGES.length;var ns=STAGES[ni];
var target=document.querySelector('[data-stage="'+ns+'"] .stage-cards');
target.appendChild(card);card.style.borderLeftColor=STAGE_DATA[ns].color;
card.dataset.stage=ns;updateCounts()}
function del(id){var card=document.querySelector('[data-id="'+id+'"]');
card.remove();updateCounts()}
function updateCounts(){STAGES.forEach(function(s){
var col=document.querySelector('[data-stage="'+s+'"]');
var n=col.querySelectorAll('.card-item').length;
col.querySelector('.stage-count').textContent=n})}
function toggleChat(){var b=document.getElementById('chat-body');
var p=document.getElementById('chat');
if(b.hidden){b.hidden=false;p.classList.remove('closed')}
else{b.hidden=true;p.classList.add('closed')}}
function sendMsg(){var inp=document.getElementById('chat-in');var t=inp.value.trim();
if(!t)return;inp.value='';var box=document.getElementById('chat-msgs');
if(t.startsWith('/card ')){var title=t.slice(6);addCard(title);
t='Created card: "'+title+'"'}
box.innerHTML+='<div class="chat-msg"><div class="chat-msg-header">'+
'<span class="user-dot" style="background:#3b82f6"></span>'+
'<span class="chat-msg-name">You</span></div>'+
'<p class="chat-msg-text">'+t+'</p></div>';
box.scrollTop=box.scrollHeight}
function addCard(title){var col=document.querySelector('[data-stage="red"] .stage-cards');
var id='c'+Date.now();
col.insertAdjacentHTML('beforeend',
'<div class="card-item" draggable="true" data-id="'+id+'" data-stage="red"'+
' style="border-left-color:#ef4444" ondragstart="ds(event)">'+
'<div class="card-top" onclick="toggle(\\''+id+'\\')">'+
'<h4 class="card-title">'+title+'</h4>'+
'<span class="card-expand">▸</span></div>'+
'<div class="card-tags"><span class="card-tag" style="background:#ef4444"></span></div>'+
'<div class="card-expanded" id="ex-'+id+'" hidden>'+
'<div class="card-actions">'+
'<button class="btn btn-sm" onclick="advance(\\''+id+'\\')">→ Brainstorm</button>'+
'<button class="btn btn-sm btn-danger" onclick="del(\\''+id+'\\')">✕</button>'+
'</div></div></div>');updateCounts()}
function showAdd(){var area=document.querySelector('.add-card-area');
area.innerHTML='<div class="add-card-form">'+
'<input class="add-card-input" id="new-card" placeholder="What is the question?"'+
' onkeydown="if(event.key===\\'Enter\\')doAdd()">'+
'<div style="display:flex;gap:6px">'+
'<button class="btn btn-primary" onclick="doAdd()">Add</button>'+
'<button class="btn" onclick="cancelAdd()">Cancel</button></div></div>'}
function doAdd(){var inp=document.getElementById('new-card');
var t=inp.value.trim();if(t){addCard(t)}cancelAdd()}
function cancelAdd(){var area=document.querySelector('.add-card-area');
area.innerHTML='<button class="btn btn-add" onclick="showAdd()">+ Add Question</button>'}
`;

// Assemble
const sections = headerHtml + '\n' + cycleHtml + '\n' + boardHtml + '\n' + chatHtml;
const html = fill(layoutTpl, {
  title: headerData.title,
  subtitle: headerData.subtitle,
  styles: css,
  sections,
  script,
});

fs.writeFileSync(OUT, html, 'utf8');
console.log('Built', OUT, '(' + html.length + ' bytes)');
