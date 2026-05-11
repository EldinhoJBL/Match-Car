import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { loadVehicles, formatBRL, type Vehicle, type VehicleCategory, type VehicleTier } from "@/lib/vehicles";
import { gerarRecomendacao } from "@/lib/recommend.functions";
import { Sparkles, Loader2, Wallet } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "AutoMatch — Recomendação de veículos" },
      { name: "description", content: "Encontre o carro ideal para o seu perfil. Hatch, Sedan ou Pickup com sugestões de IA." },
    ],
  }),
});

const TIERS: VehicleTier[] = ["Custo-Benefício", "Conforto", "Top de Linha"];

function pickThree(vehicles: Vehicle[], categoria: VehicleCategory): Vehicle[] {
  const filt = vehicles.filter((v) => v.categoria === categoria);
  return TIERS.map((t) => {
    const ofTier = filt.filter((v) => v.tier === t).sort((a, b) => a.preco - b.preco);
    return ofTier[0];
  }).filter(Boolean) as Vehicle[];
}

function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [idade, setIdade] = useState("");
  const [salario, setSalario] = useState("");
  const [profissao, setProfissao] = useState("");
  const [categoria, setCategoria] = useState<VehicleCategory>("Hatch");
  const [resultado, setResultado] = useState<{ candidatos: Vehicle[]; texto: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const recomendar = useServerFn(gerarRecomendacao);

  useEffect(() => {
    setVehicles(loadVehicles());
  }, []);

  const orcamento = useMemo(() => (Number(salario) || 0) * 20, [salario]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const sal = Number(salario);
    const id = Number(idade);
    if (!id || !sal || !profissao) return;
    setLoading(true);
    setResultado(null);
    const candidatos = pickThree(vehicles, categoria);
    try {
      const r = await recomendar({
        data: { idade: id, salario: sal, profissao, categoria, candidatos },
      });
      setResultado({ candidatos, texto: r.texto });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <section className="text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Encontre o carro certo para você</h1>
          <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
            Conte um pouco sobre seu perfil e nossa IA recomenda 3 modelos: Custo-Benefício, Conforto e Top de Linha.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-10 grid gap-8 lg:grid-cols-[400px_1fr]">
        <Card className="h-fit shadow-lg" style={{ boxShadow: "var(--shadow-card)" }}>
          <CardHeader>
            <CardTitle>Seu perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="idade">Idade</Label>
                <Input id="idade" type="number" min={16} value={idade} onChange={(e) => setIdade(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="salario">Salário mensal (R$)</Label>
                <Input id="salario" type="number" min={0} value={salario} onChange={(e) => setSalario(e.target.value)} required />
                {orcamento > 0 && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Wallet className="h-3 w-3" /> Orçamento estimado (20×): <span className="font-semibold text-foreground">{formatBRL(orcamento)}</span>
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="profissao">Profissão</Label>
                <Input id="profissao" value={profissao} onChange={(e) => setProfissao(e.target.value)} required placeholder="Ex: Engenheiro" />
              </div>
              <div>
                <Label>Categoria preferida</Label>
                <Tabs value={categoria} onValueChange={(v) => setCategoria(v as VehicleCategory)} className="mt-2">
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="Hatch">Hatch</TabsTrigger>
                    <TabsTrigger value="Sedan">Sedan</TabsTrigger>
                    <TabsTrigger value="Pickup">Pickup</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Recomendar com IA
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!resultado && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                Preencha o formulário ao lado para ver suas recomendações.
              </CardContent>
            </Card>
          )}
          {loading && (
            <Card><CardContent className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /><p className="mt-3 text-muted-foreground">Consultando a IA…</p></CardContent></Card>
          )}
          {resultado && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {resultado.candidatos.map((v) => (
                  <VehicleCard key={v.id} v={v} />
                ))}
              </div>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />Análise da IA</CardTitle></CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">{resultado.texto}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function tierColor(t: VehicleTier) {
  if (t === "Custo-Benefício") return "bg-[var(--color-tier-budget)] text-white";
  if (t === "Conforto") return "bg-[var(--color-tier-comfort)] text-white";
  return "bg-[var(--color-tier-top)] text-white";
}

function VehicleCard({ v }: { v: Vehicle }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="aspect-video bg-muted overflow-hidden">
        <img src={v.imagem} alt={`${v.marca} ${v.modelo}`} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <CardContent className="p-4 flex flex-col gap-2 flex-1">
        <Badge className={tierColor(v.tier)}>{v.tier}</Badge>
        <h3 className="font-semibold text-lg leading-tight">{v.marca} {v.modelo}</h3>
        <p className="text-sm text-muted-foreground">{v.ano} · {v.categoria}</p>
        <p className="text-sm flex-1">{v.descricao}</p>
        <p className="text-xl font-bold text-primary">{formatBRL(v.preco)}</p>
      </CardContent>
    </Card>
  );
}
