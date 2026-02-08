import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface QuickPatientRegistrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function QuickPatientRegistration({
  open,
  onOpenChange,
  onSuccess,
}: QuickPatientRegistrationProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    fechaNacimiento: "",
  });

  const createPatient = trpc.patients.create.useMutation({
    onSuccess: () => {
      toast({
        title: "✅ Paciente registrado",
        description: "El paciente ha sido registrado exitosamente",
      });
      setFormData({ nombre: "", telefono: "", email: "", fechaNacimiento: "" });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "❌ Error al registrar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.nombre || formData.nombre.length < 3) {
      toast({
        title: "⚠️ Nombre inválido",
        description: "El nombre debe tener al menos 3 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!formData.telefono) {
      toast({
        title: "⚠️ Teléfono requerido",
        description: "El teléfono es obligatorio",
        variant: "destructive",
      });
      return;
    }

    // Separar nombre e apellido
    const nameParts = formData.nombre.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || nameParts[0];

    createPatient.mutate({
      firstName,
      lastName,
      phone: formData.telefono,
      whatsappNumber: formData.telefono,
      email: formData.email || undefined,
      dateOfBirth: formData.fechaNacimiento || undefined,
    });
  };

  const formatPhone = (value: string) => {
    // Remove tudo exceto números e +
    let cleaned = value.replace(/[^\d+]/g, "");
    
    // Se não começar com +, adiciona +595 (Paraguay)
    if (!cleaned.startsWith("+")) {
      if (cleaned.length > 0) {
        cleaned = "+595 " + cleaned;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, telefono: formatted });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            Cadastro Rápido de Paciente
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-sm font-medium">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              placeholder="João da Silva"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-sm font-medium">
              Telefone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telefono"
              type="tel"
              placeholder="+55 11 98765-4321"
              value={formData.telefono}
              onChange={handlePhoneChange}
              className="w-full"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="joao@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaNacimiento" className="text-sm font-medium">
              Data de Nascimento
            </Label>
            <Input
              id="fechaNacimiento"
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createPatient.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createPatient.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPatient.isPending ? "Cadastrando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
