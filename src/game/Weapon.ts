export type WeaponType = "pistol" | "rifle" | "shotgun";

export interface Weapon {
  name: string;
  damage: number;
  fireRate: number;
  bulletSpeed: number;
  bulletsPerShot: number;
  spread: number;
}

export const WEAPONS: Record<WeaponType, Weapon> = {
  pistol: {
    name: "Pistola",
    damage: 25,
    fireRate: 300,
    bulletSpeed: 800,
    bulletsPerShot: 1,
    spread: 0,
  },

  rifle: {
    name: "Rifle",
    damage: 15,
    fireRate: 110,
    bulletSpeed: 1000,
    bulletsPerShot: 1,
    spread: 0.03,
  },

  shotgun: {
    name: "Shotgun",
    damage: 20,
    fireRate: 650,
    bulletSpeed: 720,
    bulletsPerShot: 5,
    spread: 0.25,
  },
};
