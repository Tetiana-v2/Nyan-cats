import { getCurrentResources, resolveRound, startGame } from './engine.js';
import { EVENT_LIBRARY, ROLE_DEFS, getRoleActions } from './events.js';
import { addPlayer, assembleDemoCrew, createRoom, generateRoomCode, loadRoom, updateRoom } from './network.js';
import { renderGame, renderLobby, renderOutcome, renderStatus } from './ui.js';

const appRoot = document.querySelector('#app');
const localState = {
  room: null,
  playerName: 'Космічний командир',
  role: 'captain'
};

function applyRoom(room) {
  localState.room = room;
  updateRoom(room);
  renderStatus(room?.status === 'lobby' ? 'Лобі' : room?.status === 'active' ? 'Активний раунд' : room?.status === 'victory' ? 'Перемога' : room?.status === 'game-over' ? 'Поразка' : 'Лобі');

  if (!room || !room.players?.length) {
    renderLobby(appRoot, room, localState.playerName, createRoomLocal, joinRoomLocal, startRoundLocal);
    return;
  }

  const roomState = room.status === 'active' ? 'active' : room.gameOver ? 'outcome' : room.status;

  if (room.gameOver) {
    renderOutcome(appRoot, room);
    return;
  }

  if (room.status === 'lobby') {
    renderLobby(appRoot, room, localState.playerName, createRoomLocal, joinRoomLocal, startRoundLocal);
    return;
  }

  renderGame(appRoot, room, localState.playerName, localState.role, (actionId) => {
    const member = room.players.find((player) => player.name === localState.playerName);
    if (!member) {
      return;
    }

    const target = room.players.find((player) => player.id === member.id);
    if (!target) {
      return;
    }

    target.ready = true;
    target.choice = actionId;
    room.status = 'active';
    room.lastResult = `${ROLE_DEFS[target.role].label} вибрав: ${EVENT_LIBRARY[target.role].find((item) => item.id === actionId)?.label ?? actionId}`;

    const readyCount = room.players.filter((player) => player.ready).length;
    if (readyCount >= room.players.length) {
      resolveRound(room);
    }

    updateRoom(room);
    applyRoom(room);
  });
}

function initDefaultRoom() {
  const seed = loadRoom('SPACE7') ?? assembleDemoCrew('SPACE7');
  localState.room = seed;
  localState.playerName = seed.players[0]?.name ?? 'Космічний командир';
  localState.role = seed.players[0]?.role ?? 'captain';
  applyRoom(seed);
}

function createRoomLocal(playerName) {
  const code = generateRoomCode();
  const room = createRoom(code);
  room.players = [
    { id: 'local-player', name: playerName || 'Космічний командир', role: 'captain', ready: false, choice: null },
    { id: 'support-1', name: 'Інженер', role: 'engineer', ready: false, choice: null },
    { id: 'support-2', name: 'Офіцер', role: 'officer', ready: false, choice: null }
  ];
  localState.playerName = playerName || 'Космічний командир';
  localState.role = 'captain';
  updateRoom(room);
  applyRoom(room);
}

function joinRoomLocal(playerName, code) {
  const roomCode = (code || 'SPACE7').toUpperCase();
  const room = loadRoom(roomCode) ?? createRoom(roomCode);
  room.status = room.players.length > 0 ? room.status || 'lobby' : 'lobby';

  if (room.players.length >= 3) {
    room.lastResult = 'У цій кімнаті вже три гравці. Оберіть іншу кімнату або створіть нову.';
    updateRoom(room);
    applyRoom(room);
    return;
  }

  const hasPlayer = room.players.some((player) => player.name === playerName);
  if (!hasPlayer) {
    const role = room.players.length === 0 ? 'captain' : room.players.length === 1 ? 'engineer' : 'officer';
    room.players.push({ id: `guest-${Math.random().toString(16).slice(2, 8)}`, name: playerName || 'Космічний командир', role, ready: false, choice: null });
  }

  localState.playerName = playerName || 'Космічний командир';
  localState.role = room.players.find((player) => player.name === localState.playerName)?.role ?? 'captain';
  updateRoom(room);
  applyRoom(room);
}

function startRoundLocal() {
  const room = localState.room;
  if (!room) {
    return;
  }

  const updated = startGame(room);
  updateRoom(updated);
  applyRoom(updated);
}

const savedName = localStorage.getItem('starbase-player-name');
if (savedName) {
  localState.playerName = savedName;
}

const roomCodeFromHash = window.location.hash.replace('#', '').trim().toUpperCase();
if (roomCodeFromHash) {
  const room = loadRoom(roomCodeFromHash);
  if (room) {
    localState.room = room;
    localState.playerName = localStorage.getItem('starbase-player-name') || room.players[0]?.name || 'Космічний командир';
    localState.role = room.players.find((player) => player.name === localState.playerName)?.role || 'captain';
    applyRoom(room);
  }
} else {
  initDefaultRoom();
}

window.addEventListener('beforeunload', () => {
  localStorage.setItem('starbase-player-name', localState.playerName || 'Космічний командир');
});

window.addEventListener('hashchange', () => {
  const code = window.location.hash.replace('#', '').trim().toUpperCase();
  if (code) {
    const room = loadRoom(code) ?? createRoom(code);
    localState.room = room;
    localState.playerName = localStorage.getItem('starbase-player-name') || 'Космічний командир';
    applyRoom(room);
  }
});

const nameField = document.querySelector('#player-name');
if (nameField) {
  nameField.addEventListener('input', (event) => {
    localState.playerName = event.target.value || 'Космічний командир';
    localStorage.setItem('starbase-player-name', localState.playerName);
  });
}
