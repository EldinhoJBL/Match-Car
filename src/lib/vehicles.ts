export type VehicleCategory = "Hatch" | "Sedan" | "Pickup";
export type VehicleTier = "Custo-Benefício" | "Conforto" | "Top de Linha";

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: VehicleCategory;
  preco: number;
  tier: VehicleTier;
  imagem: string;
  descricao: string;
}

import { SEED_DATA } from "./vehicles-seed";

const STORAGE_KEY = "concessionaria_vehicles_v2";

export const SEED_VEHICLES: Vehicle[] = SEED_DATA;

export function loadVehicles(): Vehicle[] {
  if (typeof window === "undefined") return SEED_VEHICLES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_VEHICLES));
      return SEED_VEHICLES;
    }
    return JSON.parse(raw) as Vehicle[];
  } catch {
    return SEED_VEHICLES;
  }
}

export function saveVehicles(list: Vehicle[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
