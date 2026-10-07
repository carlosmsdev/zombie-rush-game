export type WeaponType = "pistol" | "rifle" | "shotgun";

export interface WeaponConfig {
  name: string;
  damage: number;
  bulletSpeed: number;
  fireRate: number;
  bulletsPerShot: number;
  spread: number;
}

export const WEAPONS: Record<WeaponType, WeaponConfig> = {
  pistol: {
    name: "Pistola",
    damage: 25,
    bulletSpeed: 700,
    fireRate: 350,
    bulletsPerShot: 1,
    spread: 0,
  },

  rifle: {
    name: "Rifle",
    damage: 15,
    bulletSpeed: 850,
    fireRate: 120,
    bulletsPerShot: 1,
    spread: 0,
  },

  shotgun: {
    name: "Shotgun",
    damage: 20,
    bulletSpeed: 650,
    fireRate: 650,
    bulletsPerShot: 5,
    spread: 0.22,
  },
};
