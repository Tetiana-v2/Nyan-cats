const ROOM_PREFIX = 'starbase-survival-room:';

export const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'starbase-survival.firebaseapp.com',
  databaseURL: 'https://starbase-survival-default-rtdb.firebaseio.com',
  projectId: 'starbase-survival'
};

export function connectFirebase() {
  if (!window.firebase) {
    return null;
  }

  const app = window.firebase.apps?.[0] ?? window.firebase.initializeApp(firebaseConfig);
  return app.database();
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function saveRoom(room) {
  if (!room?.code) {
    return;
  }

  localStorage.setItem(`${ROOM_PREFIX}${room.code}`, JSON.stringify(room));
}

export function loadRoom(code) {
  const raw = localStorage.getItem(`${ROOM_PREFIX}${code}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function createRoom(code = generateRoomCode()) {
  const room = {
    code,
    round: 1,
    status: 'lobby',
    players: [],
    resources: { oxygen: 68, energy: 64, credits: 42 },
    lastResult: 'Команда в лобі. Очікуємо готовності.',
    gameOver: false,
    winner: false
  };

  saveRoom(room);
  return room;
}

export function addPlayer(room, name, role) {
  if (!room || !name || !role) {
    return room;
  }

  const nextPlayers = room.players.filter((player) => player.role !== role);
  const player = {
    id: `player-${Math.random().toString(16).slice(2, 8)}`,
    name,
    role,
    ready: false,
    choice: null
  };

  nextPlayers.push(player);
  room.players = nextPlayers;
  saveRoom(room);
  return room;
}

export function updateRoom(room) {
  if (!room?.code) {
    return null;
  }

  saveRoom(room);
  return room;
}

export function assembleDemoCrew(roomCode = generateRoomCode()) {
  const room = createRoom(roomCode);
  room.players = [
    { id: 'demo-captain', name: 'Капітан', role: 'captain', ready: true, choice: null },
    { id: 'demo-engineer', name: 'Інженер', role: 'engineer', ready: true, choice: null },
    { id: 'demo-officer', name: 'Офіцер', role: 'officer', ready: true, choice: null }
  ];

  saveRoom(room);
  return room;
}
