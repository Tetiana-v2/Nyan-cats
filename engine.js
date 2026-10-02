import { EVENT_LIBRARY, ROLE_DEFS } from './events.js';

const THRESHOLDS = {
  oxygen: 20,
  energy: 15,
  credits: 10
};

export function getCurrentResources(room) {
  return room?.resources ?? { oxygen: 0, energy: 0, credits: 0 };
}

export function resolveRound(room) {
  if (!room || room.gameOver) {
    return room;
  }

  if (room.players.length !== 3) {
    room.lastResult = 'Гра розрахована на 3 гравців: капітан, інженер і офіцер.';
    room.status = 'lobby';
    return room;
  }

  const readyPlayers = room.players.filter((player) => player.ready && player.choice);
  if (readyPlayers.length !== room.players.length || room.players.length === 0) {
    room.lastResult = 'Чекаємо на рішення кожного члена екіпажу.';
    return room;
  }

  const works = readyPlayers.map((player) => {
    const options = EVENT_LIBRARY[player.role] ?? [];
    const selected = options.find((option) => option.id === player.choice) ?? options[0];
    return {
      player,
      selected,
      delta: selected?.effect ?? { oxygen: 0, energy: 0, credits: 0 }
    };
  });

  const combined = works.reduce(
    (acc, current) => {
      Object.entries(current.delta).forEach(([key, value]) => {
        acc[key] = (acc[key] ?? 0) + value;
      });
      return acc;
    },
    { oxygen: 0, energy: 0, credits: 0 }
  );

  room.resources = {
    oxygen: Math.max(0, room.resources.oxygen + combined.oxygen),
    energy: Math.max(0, room.resources.energy + combined.energy),
    credits: Math.max(0, room.resources.credits + combined.credits)
  };

  const resourceSummary = works
    .map((entry) => `${ROLE_DEFS[entry.player.role].label}: ${entry.selected.label}`)
    .join(' • ');

  room.lastResult = `${resourceSummary}. Результат раунду: ${JSON.stringify(combined)}`;
  room.round += 1;

  room.players = room.players.map((player) => ({ ...player, ready: false, choice: null }));

  const fails = Object.entries(room.resources)
    .filter(([key, value]) => value <= THRESHOLDS[key])
    .map(([key]) => key);

  if (fails.length > 0) {
    room.gameOver = true;
    room.winner = false;
    room.status = 'game-over';
    room.lastResult = `Станція на межі руйнування. Критичні ресурси: ${fails.join(', ')}.`;
    return room;
  }

  const victoryThreshold = room.round >= 6;
  if (victoryThreshold) {
    room.gameOver = true;
    room.winner = true;
    room.status = 'victory';
    room.lastResult = 'Екіпаж пережив кілька циклів. Станція стабілізована.';
    return room;
  }

  room.status = 'active';
  return room;
}

export function startGame(room) {
  if (!room) {
    return null;
  }

  room.status = 'active';
  room.gameOver = false;
  room.winner = false;
  room.lastResult = 'Новий раунд розпочався. Команда приймає рішення.';
  room.players = room.players.map((player) => ({ ...player, ready: false, choice: null }));
  return room;
}
