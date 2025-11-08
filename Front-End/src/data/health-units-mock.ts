// src/data/health-units-mock.ts
import { HealthUnit } from "@/types/health-units";
import { get_estoque, get_unidades } from "../services/unidades";

const unidades = await get_unidades();
const estoque = await get_estoque();

export const healthUnits: HealthUnit[] = unidades.map((unit, index) => {
  const estoqueDaUnidade = estoque.filter(
    (item) => item.id_unidade === unit.id
  );

  const medications = estoqueDaUnidade
    .map((itemEstoque, medIndex) => {
      const medInfo = itemEstoque.lote?.medicamento;
      if (!medInfo) return null;

      const quantity = itemEstoque.quantidade;
      const minStock = 50;
      const maxStock = 100;
      let status: "healthy" | "normal" | "attention" | "urgent" = "healthy";

      if (quantity === 0) status = "urgent";
      else if (quantity < minStock) status = "attention";
      else if (quantity < minStock * 1.5) status = "normal";

      return {
        id: `med-${unit.id}-${medInfo.id_medicamento}`,
        name: medInfo.nome,
        dosage: medInfo.concentracao,
        tipo: medInfo.tipo,
        quantity,
        minStock,
        maxStock,
        status,
        imageUrl: medInfo.imagem_url || "",
        description: medInfo.descricao || "",
        requiresPrescription: medInfo.requer_prescricao || false,
        viewingCount: 0,
      };
    })
    .filter(Boolean) as any[];

  let type:
    | "UBS"
    | "UPA"
    | "Hospital"
    | "Clínica"
    | "Farmácia"
    | "USF"
    | "Farmácia Popular"
    | "UCAF" = "UBS";
  if (unit.name.includes("UCAF")) type = "UCAF";
  else if (unit.name.includes("UBS")) type = "UBS";
  else if (unit.name.includes("USF")) type = "USF";
  else if (unit.name.includes("UPA")) type = "UPA";
  else if (unit.name.includes("Farmácia")) type = "Farmácia";

  let unitStatus: "healthy" | "normal" | "attention" | "urgent" = "normal";
  const totalMedicamentos = medications.length;

  if (totalMedicamentos > 0) {
    const totalUrgente = medications.filter(
      (m) => m!.status === "urgent"
    ).length;
    const totalAtencao = medications.filter(
      (m) => m!.status === "attention"
    ).length;
    const totalHealthy = medications.filter(
      (m) => m!.status === "healthy"
    ).length;

    const percentUrgente = totalUrgente / totalMedicamentos;
    const percentAtencaoOuPior =
      (totalUrgente + totalAtencao) / totalMedicamentos;
    const percentHealthy = totalHealthy / totalMedicamentos;

    if (percentUrgente > 0.5) {
      unitStatus = "urgent";
    } else if (percentAtencaoOuPior >= 0.5) {
      unitStatus = "attention";
    } else if (percentHealthy > 0.9) {
      unitStatus = "healthy";
    } else {
      unitStatus = "normal";
    }
  } else {
    unitStatus = "normal";
  }

  return {
    id: `unit-${unit.id}`,
    name: unit.name,
    address: unit.address,
    coordinates: [unit.lat, unit.lon],
    type,
    status: unitStatus,
    workingHours: `${unit.aberto} - ${unit.fechado}`,
    phone: unit.tel,
    manager: "Dr. João Silva",
    services: ["Consultas", "Vacinação", "Curativos"],
    medications: medications.filter((m) => m !== null) as Exclude<
      (typeof medications)[0],
      null
    >[],
  };
});