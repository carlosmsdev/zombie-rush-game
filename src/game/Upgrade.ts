import type { Player } from "./Player";

export type UpgradeId =
  | "moveSpeed"
  | "maxHealth"
  | "heal"
  | "damage"
  | "fireRate"
  | "bulletSpeed"
  | "extraProjectile"
  | "criticalChance"
  | "pickupRange";

export interface Upgrade {
  id: UpgradeId;

  name: string;

  description: string;

  apply: (player: Player) => void;
}

export const UPGRADES: Upgrade[] = [
  {
    id: "moveSpeed",

    name: "Velocidade +10%",

    description: "Aumenta sua velocidade de movimento.",

    apply: (player) => {
      player.speed *= 1.1;

      player.speed = Math.min(player.speed, 500);
    },
  },

  {
    id: "maxHealth",

    name: "Vida Máxima +20",

    description: "Aumenta a vida máxima e recupera 20 HP.",

    apply: (player) => {
      player.maxHealth += 20;

      player.heal(20);
    },
  },

  {
    id: "heal",

    name: "Recuperação",

    description: "Recupera 35 pontos de vida.",

    apply: (player) => {
      player.heal(35);
    },
  },

  {
    id: "damage",

    name: "Dano +15%",

    description: "Aumenta o dano de todas as armas.",

    apply: (player) => {
      player.damageMultiplier *= 1.15;
    },
  },

  {
    id: "fireRate",

    name: "Cadência +12%",

    description: "Aumenta a velocidade dos disparos.",

    apply: (player) => {
      player.fireRateMultiplier *= 0.88;

      player.fireRateMultiplier = Math.max(player.fireRateMultiplier, 0.35);
    },
  },

  {
    id: "bulletSpeed",

    name: "Bala +15%",

    description: "Aumenta a velocidade dos projéteis.",

    apply: (player) => {
      player.bulletSpeedMultiplier *= 1.15;
    },
  },

  {
    id: "extraProjectile",

    name: "Projétil Extra",

    description: "Dispara uma bala adicional.",

    apply: (player) => {
      player.extraProjectiles += 1;

      player.extraProjectiles = Math.min(player.extraProjectiles, 5);
    },
  },

  {
    id: "criticalChance",

    name: "Crítico +10%",

    description: "Aumenta a chance de causar dano crítico.",

    apply: (player) => {
      player.criticalChance += 0.1;

      player.criticalChance = Math.min(player.criticalChance, 0.6);
    },
  },

  {
    id: "pickupRange",

    name: "Ímã +25%",

    description: "Aumenta a distância de coleta de XP.",

    apply: (player) => {
      player.pickupRange *= 1.25;

      player.pickupRange = Math.min(player.pickupRange, 400);
    },
  },
];
