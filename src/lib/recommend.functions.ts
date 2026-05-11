import { createServerFn } from "@tanstack/react-start";
import type { Vehicle, VehicleCategory } from "./vehicles";

interface Input {
  idade: number;
  salario: number;
  profissao: string;
  categoria: VehicleCategory;
  candidatos: Vehicle[]; // 3 selected (custo-beneficio, conforto, top)
}

export const gerarRecomendacao = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { texto: "Configuração de IA indisponível. Mostrando seleção baseada em regras." };
    }

    const multiplicador = data.salario < 4000 ? 10 : 20;
    const orcamento = data.salario * multiplicador;
    const lista = data.candidatos
      .map(
        (v, i) =>
          `${i + 1}. [${v.tier}] ${v.marca} ${v.modelo} ${v.ano} - R$ ${v.preco.toLocaleString("pt-BR")} - ${v.descricao}`
      )
      .join("\n");

    const prompt = `Você é um consultor automotivo. Cliente: ${data.idade} anos, profissão "${data.profissao}", salário mensal R$ ${data.salario.toLocaleString("pt-BR")}, orçamento estimado (${multiplicador}x salário) R$ ${orcamento.toLocaleString("pt-BR")}, prefere categoria ${data.categoria}.

Veículos pré-selecionados (apresente nesta ordem):
${lista}

Escreva uma recomendação curta (até 180 palavras), em português, justificando cada um dos 3 veículos para este perfil, na ordem: Conforto, Custo-Benefício, Top de Linha. Tom amigável e objetivo. Use markdown leve com **negrito** nos modelos.`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é um consultor automotivo brasileiro experiente." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        if (res.status === 429) return { texto: "Muitas requisições. Tente novamente em instantes." };
        if (res.status === 402) return { texto: "Créditos de IA esgotados. Adicione créditos no workspace." };
        return { texto: "Não foi possível gerar a recomendação no momento." };
      }
      const json = await res.json();
      const texto = json?.choices?.[0]?.message?.content ?? "Sem resposta da IA.";
      return { texto };
    } catch (e) {
      console.error("AI error", e);
      return { texto: "Erro ao consultar a IA." };
    }
  });
