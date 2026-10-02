import { EVENT_LIBRARY, ROLE_DEFS } from './events.js';

export function renderStatus(value) {
  const el = document.querySelector('#global-status');
  if (el) {
    el.textContent = value;
  }
}

export function renderLobby(container, room, currentPlayerName, onCreateRoom, onJoinRoom, onStartGame) {
  const safeName = currentPlayerName || 'Космічний командир';
  const isActive = room?.status === 'active' || room?.status === 'game-over' || room?.status === 'victory';
  const canStart = room?.players?.length === 3 && !isActive;

  container.innerHTML = `
    <section class="panel lobby-panel">
      <div class="lobby-grid">
        <div>
          <h2>Лобі</h2>
          <label>
            <span>Ваше ім'я</span>
            <input id="player-name" value="${safeName}" />
          </label>

          <div class="room-actions">
            <button id="create-room">Створити кімнату</button>
            <button id="random-room" class="secondary">Генерувати новий код</button>
          </div>

          <label>
            <span>Код кімнати</span>
            <input id="room-code" value="${room?.code ?? 'SPACE7'}" maxlength="6" />
          </label>

          <div class="room-actions">
            <button id="join-room">Приєднатися</button>
            <button id="start-game" ${canStart ? '' : 'disabled'}>Почати раунд</button>
          </div>
        </div>

        <div>
          <h3>Екіпаж</h3>
          <div class="crew-list">
            ${(room?.players ?? []).map((player) => `
              <div class="crew-member" style="border-color: ${ROLE_DEFS[player.role].color};">
                <span>${ROLE_DEFS[player.role].label}</span>
                <strong>${player.name}</strong>
                <small>${player.ready ? 'Готовий' : 'Чекає рішення'}</small>
              </div>
            `).join('') || '<p>Кімната порожня.</p>'}
          </div>
        </div>
      </div>
    </section>
  `;

  const createButton = document.querySelector('#create-room');
  const joinButton = document.querySelector('#join-room');
  const startButton = document.querySelector('#start-game');

  createButton?.addEventListener('click', () => {
    const value = document.querySelector('#player-name')?.value?.trim() || 'Космічний командир';
    onCreateRoom(value);
  });

  joinButton?.addEventListener('click', () => {
    const code = document.querySelector('#room-code')?.value?.trim().toUpperCase();
    const value = document.querySelector('#player-name')?.value?.trim() || 'Космічний командир';
    onJoinRoom(value, code);
  });

  startButton?.addEventListener('click', () => onStartGame());

  const randomButton = document.querySelector('#random-room');
  randomButton?.addEventListener('click', () => {
    document.querySelector('#room-code').value = Math.random().toString(36).slice(2, 8).toUpperCase();
  });
}

export function renderGame(container, room, currentPlayerName, currentPlayerRole, onPickChoice) {
  const player = room.players.find((member) => member.name === currentPlayerName) ?? room.players[0];
  const role = currentPlayerRole || player?.role || 'captain';

  const actions = EVENT_LIBRARY[role] ?? [];

  const crewCards = room.players.map((member) => `
    <div class="crew-card ${member.role === role ? 'active-role' : ''}">
      <span class="dot" style="background:${ROLE_DEFS[member.role].color};"></span>
      <div>
        <strong>${member.name}</strong>
        <small>${ROLE_DEFS[member.role].label}</small>
      </div>
      <span class="status-tag ${member.ready ? 'ready' : 'waiting'}">${member.ready ? 'готовий' : 'чекає'}</span>
    </div>
  `).join('');

  container.innerHTML = `
    <section class="panel game-panel">
      <div class="top-grid">
        <div>
          <p class="eyebrow">Команда</p>
          <h2>Кімната #${room.code}</h2>
        </div>
        <div class="round-pill">Раунд ${room.round}</div>
      </div>

      <div class="resource-grid">
        <div class="resource-box oxygen"><span>O₂</span><strong>${room.resources.oxygen}</strong></div>
        <div class="resource-box energy"><span>Енергія</span><strong>${room.resources.energy}</strong></div>
        <div class="resource-box credits"><span>Кредити</span><strong>${room.resources.credits}</strong></div>
      </div>

      <div class="board-grid">
        <div class="panel-box">
          <h3>Екіпаж</h3>
          <div class="crew-list compact">${crewCards}</div>
        </div>

        <div class="panel-box">
          <h3>Ваш вибір: ${ROLE_DEFS[role].label}</h3>
          <div class="actions-grid">
            ${actions.map((action) => `
              <button class="action-btn" data-action="${action.id}">
                <span>${action.label}</span>
                <small>${action.summary}</small>
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="status-box">
        <h3>Статус систем</h3>
        <p>${room.lastResult}</p>
      </div>
    </section>
  `;

  container.querySelectorAll('.action-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const actionId = button.dataset.action;
      onPickChoice(actionId);
    });
  });
}

export function renderOutcome(container, room) {
  const statusText = room.winner ? 'Перемога' : 'Поразка';
  const style = room.winner ? 'success' : 'danger';

  container.innerHTML = `
    <section class="panel outcome-panel ${style}">
      <h2>${statusText}</h2>
      <p>${room.lastResult}</p>
      <div class="resource-grid">
        <div class="resource-box oxygen"><span>O₂</span><strong>${room.resources.oxygen}</strong></div>
        <div class="resource-box energy"><span>Енергія</span><strong>${room.resources.energy}</strong></div>
        <div class="resource-box credits"><span>Кредити</span><strong>${room.resources.credits}</strong></div>
      </div>
    </section>
  `;
}
