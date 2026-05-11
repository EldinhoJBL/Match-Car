import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { loadVehicles, formatBRL, type Vehicle, type VehicleCategory, type VehicleTier } from "@/lib/vehicles";
import { gerarRecomendacao } from "@/lib/recommend.functions";
import { Sparkles, Loader2, Wallet, User, DollarSign, Briefcase, Car, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Wyllkens Wcar — Consultoria Automotiva em Castanhal" },
      { name: "description", content: "Encontre o veículo perfeito para o seu perfil com nossa consultoria automotiva premium em Castanhal." },
    ],
  }),
});

const TIERS: VehicleTier[] = ["Custo-Benefício", "Conforto", "Top de Linha"];

type Pagamento = "avista" | "entrada";

interface PickOpts {
  vehicles: Vehicle[];
  categoria: VehicleCategory;
  salario: number;
  orcamentoCliente?: number; // opcional — quanto o cliente tem
  pagamento: Pagamento;
  anoPreferido?: number; // opcional
}

function pickThree({ vehicles, categoria, salario, orcamentoCliente, pagamento, anoPreferido }: PickOpts): Vehicle[] {
  // Base sempre vem do salário × multiplicador (10x se < 4k, 20x caso contrário).
  // Se o cliente informar um orçamento próprio (à vista ou entrada), ele COMPLEMENTA a base.
  const lowIncome = salario < 4000;
  const multiplier = lowIncome ? 10 : 20;
  const base = salario * multiplier;
  const extra = orcamentoCliente && orcamentoCliente > 0 ? orcamentoCliente : 0;
  const orcamento = base + extra;
  void pagamento;

  const stretch = Math.min(2.2, 1 + salario / 10000);
  const caps = {
    "Custo-Benefício": orcamento * (lowIncome ? 0.75 : 0.85),
    Conforto: orcamento * (lowIncome ? 1.0 : 1.15),
    "Top de Linha": orcamento * (lowIncome ? 1.1 : stretch),
  };

  const anoAtual = new Date().getFullYear();
  const minAnoBudget = anoAtual - 20; // últimos 20 anos para custo-benefício

  let inCat = vehicles.filter((v) => v.categoria === categoria);
  if (anoPreferido) {
    const filtrados = inCat.filter((v) => v.ano === anoPreferido);
    if (filtrados.length > 0) inCat = filtrados;
  }
  if (inCat.length === 0) return [];

  const used = new Set<string>();

  // Conforto → o MAIS PRÓXIMO do orçamento total (escolhido primeiro)
  const comfortPool = inCat
    .filter((v) => v.preco <= caps["Conforto"])
    .sort((a, b) => Math.abs(a.preco - orcamento) - Math.abs(b.preco - orcamento));
  const comfort =
    comfortPool[0] ||
    [...inCat].sort((a, b) => Math.abs(a.preco - orcamento) - Math.abs(b.preco - orcamento))[0];
  if (comfort) used.add(comfort.id);

  // Custo-Benefício → mais em conta, mas EVITAR muito barato.
  // Piso = pelo menos 60% do orçamento (ou metade do preço do conforto).
  const piso = Math.max(orcamento * 0.6, (comfort?.preco ?? 0) * 0.5);
  const budgetPool = inCat
    .filter(
      (v) =>
        !used.has(v.id) &&
        v.ano >= minAnoBudget &&
        v.preco >= piso &&
        v.preco <= caps["Custo-Benefício"]
    )
    .sort((a, b) => Math.abs(a.preco - orcamento * 0.8) - Math.abs(b.preco - orcamento * 0.8));
  const budget =
    budgetPool[0] ||
    inCat
      .filter((v) => !used.has(v.id) && v.ano >= minAnoBudget && v.preco <= caps["Custo-Benefício"])
      .sort((a, b) => b.preco - a.preco)[0] ||
    inCat.filter((v) => !used.has(v.id)).sort((a, b) => b.preco - a.preco)[0];
  if (budget) used.add(budget.id);

  // Top de Linha → mais novo e mais caro respeitando teto
  const topPool = inCat
    .filter((v) => !used.has(v.id) && v.preco <= caps["Top de Linha"])
    .sort((a, b) => b.preco - a.preco || b.ano - a.ano);
  const top =
    topPool[0] ||
    inCat.filter((v) => !used.has(v.id)).sort((a, b) => b.preco - a.preco)[0];
  if (top) used.add(top.id);

  // Ordem de exibição: Conforto → Custo-Benefício → Top de Linha
  const order: { v: Vehicle | undefined; tier: VehicleTier }[] = [
    { v: comfort, tier: "Conforto" },
    { v: budget, tier: "Custo-Benefício" },
    { v: top, tier: "Top de Linha" },
  ];
  return order
    .filter((o) => o.v)
    .map((o) => ({ ...(o.v as Vehicle), tier: o.tier }));
}

function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [idade, setIdade] = useState("");
  const [salario, setSalario] = useState("");
  const [profissao, setProfissao] = useState("");
  const [categoria, setCategoria] = useState<VehicleCategory>("Hatch");
  const [orcamentoCliente, setOrcamentoCliente] = useState("");
  const [pagamento, setPagamento] = useState<Pagamento>("avista");
  const [anoPreferido, setAnoPreferido] = useState("");
  const [resultado, setResultado] = useState<{ candidatos: Vehicle[]; texto: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const recomendar = useServerFn(gerarRecomendacao);

  useEffect(() => {
    setVehicles(loadVehicles());
  }, []);

  const anosDisponiveis = useMemo(
    () => Array.from(new Set(vehicles.map((v) => v.ano))).sort((a, b) => b - a),
    [vehicles]
  );

  const multiplicador = useMemo(() => ((Number(salario) || 0) < 4000 ? 10 : 20), [salario]);
  const orcamentoEstimado = useMemo(() => {
    const base = (Number(salario) || 0) * multiplicador;
    const oc = Number(orcamentoCliente) || 0;
    // Sempre usa salário × multiplicador como base; orçamento informado complementa
    return base + oc;
  }, [salario, multiplicador, orcamentoCliente]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sal = Number(salario);
    const id = Number(idade);
    if (!id || !sal || !profissao) return;
    setLoading(true);
    setResultado(null);
    const candidatos = pickThree({
      vehicles,
      categoria,
      salario: sal,
      orcamentoCliente: Number(orcamentoCliente) || undefined,
      pagamento,
      anoPreferido: anoPreferido ? Number(anoPreferido) : undefined,
    });
    try {
      const r = await recomendar({
        data: { idade: id, salario: sal, profissao, categoria, candidatos },
      });
      setResultado({ candidatos, texto: r.texto });
      setTimeout(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" }), 100);
    } finally {
      setLoading(false);
    }
  }

  const categoryIcon: Record<VehicleCategory, string> = { Hatch: "🚗", Sedan: "🚙", Pickup: "🛻" };
  const categoryDesc: Record<VehicleCategory, string> = {
    Hatch: "Compacto e econômico",
    Sedan: "Conforto e espaço",
    Pickup: "Força e versatilidade",
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gradient-hero)" }}>
      <SiteNav />

      <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" /> Consultoria Automotiva Premium em Castanhal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Encontre o Veículo <span className="text-primary">Perfeito</span> para Você
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Preencha seus dados e nossa inteligência artificial encontrará o veículo ideal para seu perfil.
            Atendemos toda a região de Castanhal, Santa Izabel, Benevides e região metropolitana.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-bold">
                  <User className="h-5 w-5 text-primary" /> Dados do Cliente
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Informe seus dados para uma análise personalizada com a Wyllkens Wcar
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <Field label="Idade" icon={<User className="h-4 w-4" />}>
                  <Input type="number" min={16} value={idade} onChange={(e) => setIdade(e.target.value)} required placeholder="Ex: 35" />
                </Field>
                <Field label="Renda Mensal" icon={<DollarSign className="h-4 w-4" />}>
                  <Input type="number" min={0} value={salario} onChange={(e) => setSalario(e.target.value)} required placeholder="Ex: R$ 5.000" />
                </Field>
                <Field label="Profissão" icon={<Briefcase className="h-4 w-4" />}>
                  <Input value={profissao} onChange={(e) => setProfissao(e.target.value)} required placeholder="Ex: Engenheiro, Médico, Autônomo..." />
                </Field>
              </div>

              {orcamentoEstimado > 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                  <Wallet className="h-4 w-4 text-primary" />
                  Orçamento total ({multiplicador}× salário
                  {Number(orcamentoCliente) > 0
                    ? ` + ${pagamento === "entrada" ? "entrada" : "à vista"} de ${formatBRL(Number(orcamentoCliente))}`
                    : ""}
                  ):
                  <span className="font-semibold text-foreground">{formatBRL(orcamentoEstimado)}</span>
                </div>
              )}

              {/* Opcionais */}
              <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Opcional</h3>
                <div className="grid gap-5 md:grid-cols-3">
                  <Field label="Orçamento (R$)" icon={<Wallet className="h-4 w-4" />}>
                    <Input
                      type="number"
                      min={0}
                      value={orcamentoCliente}
                      onChange={(e) => setOrcamentoCliente(e.target.value)}
                      placeholder="Ex: 50000"
                    />
                  </Field>
                  <Field label="Forma de pagamento" icon={<DollarSign className="h-4 w-4" />}>
                    <div className="grid grid-cols-2 gap-2">
                      {(["avista", "entrada"] as Pagamento[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPagamento(p)}
                          className={`rounded-md border-2 px-3 py-2 text-sm font-medium transition-all ${
                            pagamento === p
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border bg-background/40 text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          {p === "avista" ? "À vista" : "Entrada"}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Ano do veículo" icon={<Car className="h-4 w-4" />}>
                    <select
                      value={anoPreferido}
                      onChange={(e) => setAnoPreferido(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Qualquer ano</option>
                      {anosDisponiveis.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <div>
                <h3 className="flex items-center gap-2 font-semibold mb-3">
                  <Car className="h-4 w-4 text-primary" /> Qual tipo de carro você prefere?
                </h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {(["Hatch", "Sedan", "Pickup"] as VehicleCategory[]).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategoria(c)}
                      className={`rounded-lg border-2 p-6 text-center transition-all ${
                        categoria === c
                          ? "border-primary bg-primary/5"
                          : "border-border bg-secondary/40 hover:border-primary/50"
                      }`}
                    >
                      <div className="text-3xl mb-2">{categoryIcon[c]}</div>
                      <div className="font-semibold">{c}</div>
                      <div className="text-xs text-muted-foreground mt-1">{categoryDesc[c]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-base font-semibold"
                style={{ background: "var(--gradient-cta)", boxShadow: "var(--shadow-glow)" }}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
                Encontrar Meu Veículo Ideal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {(loading || resultado) && (
          <div id="resultado" className="mt-12 space-y-6">
            {loading && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  <p className="mt-3 text-muted-foreground">Analisando seu perfil com IA…</p>
                </CardContent>
              </Card>
            )}
            {resultado && (
              <>
                <h2 className="text-2xl md:text-3xl font-bold text-center">
                  Suas <span className="text-primary">3 Recomendações</span>
                </h2>
                <div className="grid gap-5 md:grid-cols-3">
                  {resultado.candidatos.map((v, i) => (
                    <VehicleCard key={v.id} v={v} highlight={i === 0} />
                  ))}
                </div>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
                      <Sparkles className="h-5 w-5 text-primary" /> Análise da IA
                    </h3>
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-foreground/90">
                      {resultado.texto}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="font-bold">Wyllkens Wcar</span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">Compra · Venda · Troca · Financia</span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Rua Primeiro de Maio, 1253 — Pirapora, Castanhal-PA</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> (91) 98723-8874</span>
          </div>
        </div>
        <div className="h-1" style={{ background: "var(--gradient-cta)" }} />
      </footer>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary">{icon}</span> {label}
      </div>
      {children}
    </div>
  );
}

function tierColor(t: VehicleTier) {
  if (t === "Custo-Benefício") return "bg-[var(--color-tier-budget)] text-white";
  if (t === "Conforto") return "bg-[var(--color-tier-comfort)] text-white";
  return "bg-[var(--color-tier-top)] text-white";
}

function VehicleCard({ v, highlight }: { v: Vehicle; highlight?: boolean }) {
  return (
    <Card className={`overflow-hidden flex flex-col ${highlight ? "ring-2 ring-primary" : ""}`}>
      <div className="aspect-video bg-muted overflow-hidden">
        <img src={v.imagem} alt={`${v.marca} ${v.modelo}`} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <CardContent className="p-4 flex flex-col gap-2 flex-1">
        <Badge className={tierColor(v.tier)}>{v.tier}</Badge>
        <h3 className="font-semibold text-lg leading-tight">{v.marca} {v.modelo}</h3>
        <p className="text-sm text-muted-foreground">{v.ano} · {v.categoria}</p>
        <p className="text-sm flex-1 text-muted-foreground">{v.descricao}</p>
        <p className="text-xl font-bold text-primary">{formatBRL(v.preco)}</p>
      </CardContent>
    </Card>
  );
}
