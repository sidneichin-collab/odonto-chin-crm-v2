import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Users,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PreviewPatient {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  hasActiveContract?: boolean;
  contractType?: string;
}

export default function ImportarPacientes() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewPatient[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Por favor, sube un archivo CSV");
      return;
    }

    setCsvFile(file);
    processCSV(file);
  };

  const processCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("El archivo CSV está vacío");
        return;
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Parse data
      const patients: PreviewPatient[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        const patient: PreviewPatient = {
          firstName: values[headers.indexOf('nombre')] || values[headers.indexOf('firstname')] || '',
          lastName: values[headers.indexOf('apellido')] || values[headers.indexOf('lastname')] || '',
          phone: values[headers.indexOf('telefono')] || values[headers.indexOf('phone')] || '',
          email: values[headers.indexOf('email')] || values[headers.indexOf('correo')],
          dateOfBirth: values[headers.indexOf('fechanacimiento')] || values[headers.indexOf('dateofbirth')],
          gender: values[headers.indexOf('genero')] || values[headers.indexOf('gender')],
          address: values[headers.indexOf('direccion')] || values[headers.indexOf('address')],
          city: values[headers.indexOf('ciudad')] || values[headers.indexOf('city')],
          hasActiveContract: values[headers.indexOf('contratoactivo')] === 'si' || values[headers.indexOf('hasactivecontract')] === 'yes',
          contractType: values[headers.indexOf('tipocontrato')] || values[headers.indexOf('contracttype')]
        };

        if (patient.firstName && patient.lastName && patient.phone) {
          patients.push(patient);
        }
      }

      setPreviewData(patients);
      toast.success(`${patients.length} pacientes encontrados en el archivo`);
    };

    reader.onerror = () => {
      toast.error("Error al leer el archivo");
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error("No hay datos para importar");
      return;
    }

    setIsProcessing(true);
    
    // Simular importação
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < previewData.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simular 95% de sucesso
      if (Math.random() > 0.05) {
        success++;
      } else {
        failed++;
        errors.push(`Línea ${i + 2}: Error al importar ${previewData[i].firstName} ${previewData[i].lastName}`);
      }
    }

    setImportResults({
      total: previewData.length,
      success,
      failed,
      errors
    });

    setIsProcessing(false);
    toast.success(`Importación completada: ${success}/${previewData.length} exitosos`);
  };

  const handleClear = () => {
    setCsvFile(null);
    setPreviewData([]);
    setImportResults(null);
  };

  const downloadTemplate = () => {
    const template = `nombre,apellido,telefono,email,fechanacimiento,genero,direccion,ciudad,contratoactivo,tipocontrato
Juan,Pérez,+591 7654-3210,juan@email.com,1990-01-15,M,Av. Principal 123,La Paz,si,Ortodoncia
María,González,+591 7654-3211,maria@email.com,1985-05-20,F,Calle Central 456,La Paz,no,
Carlos,Silva,+591 7654-3212,carlos@email.com,1992-08-10,M,Av. Secundaria 789,La Paz,si,Clinico General`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_pacientes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success("Plantilla descargada");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Upload className="h-8 w-8 text-blue-500" />
            Importar Pacientes desde CSV
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sube un archivo CSV para importar múltiples pacientes a la vez
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Panel Izquierdo: Upload */}
          <div className="lg:col-span-1 space-y-6">
            {/* Descargar Plantilla */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plantilla CSV</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Descarga la plantilla para ver el formato correcto
                </p>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4" />
                  Descargar Plantilla
                </Button>

                <div className="bg-gray-900 rounded-lg p-3 text-xs">
                  <div className="font-semibold mb-2">Columnas requeridas:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• nombre</li>
                    <li>• apellido</li>
                    <li>• telefono</li>
                  </ul>
                  <div className="font-semibold mt-3 mb-2">Columnas opcionales:</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• email</li>
                    <li>• fechanacimiento</li>
                    <li>• genero</li>
                    <li>• direccion</li>
                    <li>• ciudad</li>
                    <li>• contratoactivo (si/no)</li>
                    <li>• tipocontrato</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subir Archivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6">
                  <Label htmlFor="csv-file" className="cursor-pointer">
                    <div className="text-center">
                      <Upload className="h-12 w-12 text-blue-500 mx-auto mb-3" />
                      <div className="font-semibold mb-1">
                        {csvFile ? csvFile.name : "Selecciona un archivo CSV"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Arrastra o haz clic para seleccionar
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {csvFile && (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                      onClick={handleImport}
                      disabled={isProcessing || previewData.length === 0}
                    >
                      {isProcessing ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Importando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Importar
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resultados */}
            {importResults && (
              <Card className="bg-green-950 border-green-800">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Resultados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-300">Total:</span>
                    <span className="font-semibold text-green-200">{importResults.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-300">Exitosos:</span>
                    <span className="font-semibold text-green-200">{importResults.success}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-300">Fallidos:</span>
                    <span className="font-semibold text-red-200">{importResults.failed}</span>
                  </div>
                  {importResults.errors.length > 0 && (
                    <div className="mt-3 text-xs text-red-300 max-h-32 overflow-y-auto">
                      {importResults.errors.map((error, i) => (
                        <div key={i}>• {error}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel Derecho: Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Vista Previa ({previewData.length} pacientes)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewData.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Sube un archivo CSV para ver la vista previa
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-900">
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Nombre</th>
                          <th className="text-left p-2">Apellido</th>
                          <th className="text-left p-2">Teléfono</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Contrato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((patient, index) => (
                          <tr key={index} className="border-b border-gray-800 hover:bg-gray-900">
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">{patient.firstName}</td>
                            <td className="p-2">{patient.lastName}</td>
                            <td className="p-2">{patient.phone}</td>
                            <td className="p-2 text-muted-foreground">{patient.email || '-'}</td>
                            <td className="p-2">
                              {patient.hasActiveContract ? (
                                <span className="text-green-400 text-xs">
                                  ✓ {patient.contractType || 'Activo'}
                                </span>
                              ) : (
                                <span className="text-gray-500 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
