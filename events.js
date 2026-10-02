export const ROLE_DEFS = {
  engineer: {
    label: 'Інженер',
    emphasis: 'Ремонт, стабілізація, живлення',
    color: '#51d0ff'
  },
  officer: {
    label: 'Офіцер',
    emphasis: 'Розвідка, захист, координація',
    color: '#80ffb2'
  },
  captain: {
    label: 'Капітан',
    emphasis: 'Стратегія, ризик і рішення',
    color: '#ffd166'
  }
};

export const EVENT_LIBRARY = {
  engineer: [
    {
      id: 'repair-works',
      label: 'Забезпечити ремонт',
      effect: { oxygen: -4, energy: -2, credits: 2 },
      summary: 'Команда відновлює систему відновлення станції.'
    },
    {
      id: 'stabilize-reactor',
      label: 'Стабілізувати реактор',
      effect: { oxygen: 1, energy: 6, credits: -3 },
      summary: 'Додатковий заряд для критичних вузлів.'
    },
    {
      id: 'seal-breach',
      label: 'Заткнути пробоїну',
      effect: { oxygen: 5, energy: -1, credits: -1 },
      summary: 'Безпечний ремонт дає час для подальших дій.'
    }
  ],
  officer: [
    {
      id: 'scan-sector',
      label: 'Сканувати сектор',
      effect: { oxygen: 0, energy: 1, credits: 4 },
      summary: 'Розвідка виявляє цінні залишки.'
    },
    {
      id: 'raise-shields',
      label: 'Підняти щити',
      effect: { oxygen: -2, energy: -3, credits: 0 },
      summary: 'Захисний контур підвищує стійкість.'
    },
    {
      id: 'route-supply',
      label: 'Маршрутизувати постачання',
      effect: { oxygen: 2, energy: 2, credits: 1 },
      summary: 'Збалансоване постачання знижує стрес на склад.'
    }
  ],
  captain: [
    {
      id: 'go-all-in',
      label: 'Ризикнути повністю',
      effect: { oxygen: -5, energy: 5, credits: 6 },
      summary: 'Рішучий крок дає шанс на різкий прорив.'
    },
    {
      id: 'preserve-supplies',
      label: 'Зберегти ресурси',
      effect: { oxygen: 3, energy: -2, credits: -2 },
      summary: 'Консервативна стратегія стабілізує станцію.'
    },
    {
      id: 'push-through',
      label: 'Прориватися вперед',
      effect: { oxygen: -3, energy: 3, credits: 3 },
      summary: 'Підсилена логістика дає більше шансів на виживання.'
    }
  ]
};

export function getRoleActions(role) {
  return EVENT_LIBRARY[role] ?? [];
}

export function defaultRoomState() {
  return {
    code: 'SPACE7',
    round: 1,
    status: 'lobby',
    players: [
      { id: 'p1', name: 'Командир', role: 'captain', ready: false, choice: null },
      { id: 'p2', name: 'Інженер', role: 'engineer', ready: false, choice: null },
      { id: 'p3', name: 'Офіцер', role: 'officer', ready: false, choice: null }
    ],
    resources: {
      oxygen: 68,
      energy: 64,
      credits: 42
    },
    lastResult: 'Команда готується до запуску.',
    gameOver: false,
    winner: false
  };
}
