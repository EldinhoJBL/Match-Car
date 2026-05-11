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
  // Hatch
  { id: "h1", marca: "Fiat", modelo: "Mobi Like", ano: 2023, categoria: "Hatch", preco: 62000, tier: "Custo-Benefício", imagem: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=900", descricao: "Compacto econômico, ideal para a cidade." },
  { id: "h2", marca: "Volkswagen", modelo: "Polo Highline", ano: 2024, categoria: "Hatch", preco: 105000, tier: "Conforto", imagem: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=900", descricao: "Acabamento refinado e tecnologia embarcada." },
  { id: "h3", marca: "Volkswagen", modelo: "Golf GTI", ano: 2024, categoria: "Hatch", preco: 240000, tier: "Top de Linha", imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900", descricao: "Esportivo turbo com performance premium." },
  // Sedan
  { id: "s1", marca: "Chevrolet", modelo: "Onix Plus", ano: 2023, categoria: "Sedan", preco: 92000, tier: "Custo-Benefício", imagem: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900", descricao: "Sedan compacto eficiente e prático." },
  { id: "s2", marca: "Honda", modelo: "Civic EXL", ano: 2023, categoria: "Sedan", preco: 145000, tier: "Conforto", imagem: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=900", descricao: "Sedan confortável com ótima dirigibilidade." },
  { id: "s3", marca: "Toyota", modelo: "Corolla Altis Hybrid", ano: 2024, categoria: "Sedan", preco: 210000, tier: "Top de Linha", imagem: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=900", descricao: "Híbrido premium com tecnologia de ponta." },
  // Pickup
  { id: "p1", marca: "Fiat", modelo: "Strada Endurance", ano: 2024, categoria: "Pickup", preco: 110000, tier: "Custo-Benefício", imagem: "https://images.unsplash.com/photo-1595953019842-9bff21f3a37e?w=900", descricao: "Picape compacta robusta para trabalho e lazer." },
  { id: "p2", marca: "Toyota", modelo: "Hilux SRV", ano: 2023, categoria: "Pickup", preco: 280000, tier: "Conforto", imagem: "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=900", descricao: "Picape média confortável e durável." },
  { id: "p3", marca: "Ford", modelo: "Ranger Limited", ano: 2024, categoria: "Pickup", preco: 380000, tier: "Top de Linha", imagem: "https://images.unsplash.com/photo-1605893477799-b99e3b400c93?w=900", descricao: "Picape full-size de luxo com tração 4x4." },
];

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
