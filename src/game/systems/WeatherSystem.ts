export type WeatherType = "clear" | "rain" | "fog" | "storm";

export interface WeatherData {
  type: WeatherType;

  name: string;

  description: string;

  visionMultiplier: number;

  soundMultiplier: number;

  scentMultiplier: number;

  playerSpeedMultiplier: number;
}

const WEATHER_DATA: Record<WeatherType, WeatherData> = {
  clear: {
    type: "clear",

    name: "TEMPO LIMPO",

    description: "Visibilidade normal.",

    visionMultiplier: 1,

    soundMultiplier: 1,

    scentMultiplier: 1,

    playerSpeedMultiplier: 1,
  },

  rain: {
    type: "rain",

    name: "CHUVA",

    description: "A chuva abafa tiros e apaga parte do cheiro.",

    visionMultiplier: 0.9,

    soundMultiplier: 0.65,

    scentMultiplier: 0.55,

    playerSpeedMultiplier: 0.97,
  },

  fog: {
    type: "fog",

    name: "NEBLINA",

    description: "Zumbis enxergam muito menos.",

    visionMultiplier: 0.52,

    soundMultiplier: 0.95,

    scentMultiplier: 1.15,

    playerSpeedMultiplier: 1,
  },

  storm: {
    type: "storm",

    name: "TEMPESTADE",

    description: "Visão e audição ficam prejudicadas.",

    visionMultiplier: 0.68,

    soundMultiplier: 0.5,

    scentMultiplier: 0.4,

    playerSpeedMultiplier: 0.92,
  },
};

export class WeatherSystem {
  currentWeather: WeatherType = "clear";

  timeRemaining: number = 55000;

  minDuration: number = 45000;

  maxDuration: number = 90000;

  private weatherChangedPending: boolean = false;

  update(delta: number) {
    this.timeRemaining -= delta;

    if (this.timeRemaining > 0) {
      return;
    }

    this.changeWeather();
  }

  private changeWeather() {
    const possibilities: WeatherType[] = ["clear", "rain", "fog", "storm"];

    const available = possibilities.filter(
      (weather) => weather !== this.currentWeather,
    );

    const index = Math.floor(Math.random() * available.length);

    this.currentWeather = available[index];

    this.timeRemaining =
      this.minDuration + Math.random() * (this.maxDuration - this.minDuration);

    this.weatherChangedPending = true;
  }

  consumeWeatherChanged() {
    if (!this.weatherChangedPending) {
      return null;
    }

    this.weatherChangedPending = false;

    return this.getCurrentWeather();
  }

  getCurrentWeather() {
    return WEATHER_DATA[this.currentWeather];
  }

  getVisionMultiplier() {
    return this.getCurrentWeather().visionMultiplier;
  }

  getSoundMultiplier() {
    return this.getCurrentWeather().soundMultiplier;
  }

  getScentMultiplier() {
    return this.getCurrentWeather().scentMultiplier;
  }

  getPlayerSpeedMultiplier() {
    return this.getCurrentWeather().playerSpeedMultiplier;
  }

  getSecondsRemaining() {
    return Math.ceil(this.timeRemaining / 1000);
  }
}
