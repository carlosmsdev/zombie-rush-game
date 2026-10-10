export type GameEventType =
  | "blackout"
  | "bloodMoon"
  | "supplyDrop"
  | "mutationWave"
  | "acidRain";

export interface GameEvent {
  type: GameEventType;

  name: string;

  description: string;

  duration: number;
}

export class EventSystem {
  activeEvent: GameEvent | null = null;

  eventTimeRemaining: number = 0;

  nextEventTimer: number = 75000;

  minTimeBetweenEvents: number = 70000;

  maxTimeBetweenEvents: number = 120000;

  events: GameEvent[] = [
    {
      type: "blackout",

      name: "BLACKOUT",

      description: "A escuridão tomou conta da região.",

      duration: 45000,
    },

    {
      type: "bloodMoon",

      name: "BLOOD MOON",

      description: "Zumbis mais rápidos, mas XP dobrado.",

      duration: 45000,
    },

    {
      type: "supplyDrop",

      name: "SUPPLY DROP",

      description: "Uma caixa militar caiu no mapa.",

      duration: 30000,
    },

    {
      type: "mutationWave",

      name: "MUTATION WAVE",

      description: "Inimigos especiais estão aparecendo.",

      duration: 40000,
    },

    {
      type: "acidRain",

      name: "ACID RAIN",

      description: "A chuva contaminada tornou a área perigosa.",

      duration: 35000,
    },
  ];

  private eventStartedPending: boolean = false;

  private eventEndedPending: boolean = false;

  update(delta: number) {
    if (this.activeEvent) {
      this.eventTimeRemaining -= delta;

      if (this.eventTimeRemaining <= 0) {
        this.finishEvent();
      }

      return;
    }

    this.nextEventTimer -= delta;

    if (this.nextEventTimer <= 0) {
      this.startRandomEvent();
    }
  }

  startRandomEvent() {
    if (this.activeEvent) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * this.events.length);

    this.activeEvent = this.events[randomIndex];

    this.eventTimeRemaining = this.activeEvent.duration;

    this.eventStartedPending = true;
  }

  finishEvent() {
    this.activeEvent = null;

    this.eventTimeRemaining = 0;

    this.nextEventTimer = this.randomEventDelay();

    this.eventEndedPending = true;
  }

  private randomEventDelay() {
    return (
      this.minTimeBetweenEvents +
      Math.random() * (this.maxTimeBetweenEvents - this.minTimeBetweenEvents)
    );
  }

  consumeEventStarted() {
    if (!this.eventStartedPending) {
      return false;
    }

    this.eventStartedPending = false;

    return true;
  }

  consumeEventEnded() {
    if (!this.eventEndedPending) {
      return false;
    }

    this.eventEndedPending = false;

    return true;
  }

  isEventActive(type: GameEventType) {
    return this.activeEvent?.type === type;
  }

  getSecondsRemaining() {
    return Math.ceil(this.eventTimeRemaining / 1000);
  }

  getXpMultiplier() {
    if (this.isEventActive("bloodMoon")) {
      return 2;
    }

    return 1;
  }

  getZombieSpeedMultiplier() {
    if (this.isEventActive("bloodMoon")) {
      return 1.4;
    }

    return 1;
  }

  getSpecialEnemyBonus() {
    if (this.isEventActive("mutationWave")) {
      return 25;
    }

    return 0;
  }

  isBlackoutActive() {
    return this.isEventActive("blackout");
  }

  isAcidRainActive() {
    return this.isEventActive("acidRain");
  }

  isSupplyDropActive() {
    return this.isEventActive("supplyDrop");
  }
}
