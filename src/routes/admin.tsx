Por favor, substitua todo o conteúdo do arquivo da rota /admin por este código corrigido para desativar temporariamente o bloqueio visual do front-end (definindo isAdmin = true):

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  fetchVehicles,
  upsertVehicle,
  deleteVehicle,
  uploadVehicleImage,
  formatBRL,
  type Vehicle,
  type VehicleCategory,
  type VehicleTier,
} from "@/lib/vehicles";
import { Pencil, Trash2, Plus, LogOut, ShieldAlert, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Área do Lojista — MatchCar" }] }),
});

function AdminPage() {
  const { user, isAdmin: authIsAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const isAdmin = true;

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="container mx-auto px-4 py-20 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" /> Acesso restrito</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sua conta ({user.email}) ainda não tem permissão de administrador. Solicite a liberação ao responsável.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" asChild><Link to="/">Voltar</Link></Button>
                <Button onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Sair</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <AdminPanel onLogout={handleLogout} />;
}

const CATEGORIAS: VehicleCategory[] = ["Hatch", "Sedan", "Pickup"];
const TIERS: VehicleTier[] = ["Custo-Benefício", "Conforto", "Top de Linha"];

function emptyVehicle(): Vehicle {
  return { id: "", marca: "", modelo: "", ano: new Date().getFullYear(), categoria: "Hatch", preco: 0, tier: "Custo-Benefício", imagem: "", descricao: "" };
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [list, setList] = useState<Vehicle[]>([]);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  async function reload() {
    setLoadingList(true);
    try {
      setList(await fetchVehicles());
    } catch (e: any) {
      toast.error("Erro ao carregar veículos: " + e.message);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => { reload(); }, []);

  async function onSave(v: Vehicle) {
    if (!v.marca || !v.modelo) { toast.error("Preencha marca e modelo"); return; }
    try {
      await upsertVehicle(v);
      setOpen(false);
      toast.success("Veículo salvo");
      await reload();
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Excluir este veículo?")) return;
    try {
      await deleteVehicle(id);
      toast.success("Veículo excluído");
      await reload();
    } catch (e: any) {
      toast.error("Erro ao excluir: " + e.message);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Catálogo de Veículos</h1>
            <p className="text-muted-foreground">Gerencie os models disponíveis para recomendação.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onLogout}><LogOut className="h-4 w-4 mr-2" />Sair</Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(emptyVehicle())}><Plus className="h-4 w-4 mr-2" />Novo veículo</Button>
              </DialogTrigger>
              {editing && <VehicleDialog v={editing} onChange={setEditing} onSave={() => onSave(editing)} />}
            </Dialog>
          </div>
        </div>

        {loadingList ? (
          <div className="text-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> Carregando…
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
            Nenhum veículo cadastrado. Clique em <strong>Novo veículo</strong> para começar.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((v) => (
              <Card key={v.id} className="overflow-hidden">
                <div className="aspect-video bg-muted overflow-hidden">
                  {v.imagem && <img src={v.imagem} alt={v.modelo} className="w-full h-full object-cover" loading="lazy" />}
                </div>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary">{v.categoria}</Badge>
                    <Badge>{v.tier}</Badge>
                  </div>
                  <h3 className="font-semibold">{v.marca} {v.modelo} <span className="text-muted-foreground font-normal">({v.ano})</span></h3>
                  <p className="text-primary font-bold">{formatBRL(v.preco)}</p>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditing(v); setOpen(true); }}><Pencil className="h-4 w-4 mr-1" />Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(v.id)}><Trash2 className="h-4 w-4 mr-1" />Excluir</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VehicleDialog({ v, onChange, onSave }: { v: Vehicle; onChange: (v: Vehicle) => void; onSave: () => void }) {
  const set = <K extends keyof Vehicle>(k: K, val: Vehicle[K]) => onChange({ ...v, [k]: val });
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem maior que 5MB"); return; }
    setUploading(true);
    try {
      const url = await uploadVehicleImage(file);
      set("imagem", url);
      toast.success("Imagem enviada");
    } catch (err: any) {
      toast.error("Erro ao enviar imagem: " + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>{v.id ? "Editar veículo" : "Novo veículo"}</DialogTitle></DialogHeader>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Marca</Label><Input value={v.marca} onChange={(e) => set("marca", e.target.value)} /></div>
          <div><Label>Modelo</Label><Input value={v.modelo} onChange={(e) => set("modelo", e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Ano</Label><Input type="number" value={v.ano} onChange={(e) => set("ano", Number(e.target.value))} /></div>
          <div><Label>Preço (R$)</Label><Input type="number" value={v.preco} onChange={(e) => set("preco", Number(e.target.value))} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Categoria</Label>
            <Select value={v.categoria} onValueChange={(val) => set("categoria", val as VehicleCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tier</Label>
            <Select value={v.tier} onValueChange={(val) => set("tier", val as VehicleTier)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIERS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Imagem do veículo</Label>
          <div className="mt-1 flex flex-col gap-2">
            {v.imagem && (
              <div className="aspect-video rounded-md overflow-hidden bg-muted border">
                <img src={v.imagem} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                {v.imagem ? "Trocar imagem" : "Enviar do dispositivo"}
              </Button>
              {v.imagem && (
                <Button type="button" variant="ghost" onClick={() => set("imagem", "")}>Remover</Button>
              )}
            </div>
          </div>
        </div>
        <div><Label>Descrição</Label><Input value={v.descricao} onChange={(e) => set("descricao", e.target.value)} /></div>
      </div>
      <DialogFooter><Button onClick={onSave} disabled={uploading}>Salvar</Button></DialogFooter>
    </DialogContent>
  );
}
