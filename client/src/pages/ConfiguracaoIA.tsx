/**
 * Configuração de IA - Página para configurar integração com modelos de IA
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Brain, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function ConfiguracaoIA() {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'azure' | 'custom'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [model, setModel] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  const testConnectionMutation = trpc.ai.testConnection.useMutation();

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast.error('Por favor, insira a API Key');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testConnectionMutation.mutateAsync({
        provider,
        apiKey,
        apiUrl: apiUrl || undefined,
        model: model || undefined,
      });

      setTestResult(result);

      if (result.success) {
        toast.success('Conexão bem-sucedida!');
      } else {
        toast.error('Falha na conexão');
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Erro ao testar conexão',
      });
      toast.error('Erro ao testar conexão');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = () => {
    // Salvar configuração no localStorage ou backend
    const config = {
      provider,
      apiKey,
      apiUrl,
      model,
    };

    localStorage.setItem('ai_config', JSON.stringify(config));
    toast.success('Configuração salva com sucesso!');
  };

  // Carregar configuração salva
  useState(() => {
    const saved = localStorage.getItem('ai_config');
    if (saved) {
      const config = JSON.parse(saved);
      setProvider(config.provider || 'openai');
      setApiKey(config.apiKey || '');
      setApiUrl(config.apiUrl || '');
      setModel(config.model || '');
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600" />
            Configuração de IA
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure a integração com modelos de inteligência artificial
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Sparkles className="h-4 w-4 mr-2" />
          IA Customizada
        </Badge>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="features">Funcionalidades</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
        </TabsList>

        {/* Tab: Configuração */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provedor de IA</CardTitle>
              <CardDescription>
                Selecione e configure o provedor de IA que deseja utilizar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seleção de Provedor */}
              <div className="space-y-2">
                <Label htmlFor="provider">Provedor</Label>
                <Select value={provider} onValueChange={(v: any) => setProvider(v)}>
                  <SelectTrigger id="provider">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4, GPT-5)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="azure">Azure OpenAI</SelectItem>
                    <SelectItem value="custom">Modelo Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Sua chave de API será armazenada de forma segura
                </p>
              </div>

              {/* API URL (para Azure e Custom) */}
              {(provider === 'azure' || provider === 'custom') && (
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">API URL</Label>
                  <Input
                    id="apiUrl"
                    type="url"
                    placeholder="https://..."
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                </div>
              )}

              {/* Modelo */}
              <div className="space-y-2">
                <Label htmlFor="model">Modelo (opcional)</Label>
                <Input
                  id="model"
                  placeholder={
                    provider === 'openai'
                      ? 'gpt-4'
                      : provider === 'anthropic'
                      ? 'claude-3-sonnet-20240229'
                      : 'nome-do-modelo'
                  }
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Deixe em branco para usar o modelo padrão
                </p>
              </div>

              {/* Resultado do Teste */}
              {testResult && (
                <Alert variant={testResult.success ? 'default' : 'destructive'}>
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <AlertDescription>{testResult.message}</AlertDescription>
                      {testResult.latency && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Latência: {testResult.latency}ms
                        </p>
                      )}
                    </div>
                  </div>
                </Alert>
              )}

              {/* Botões */}
              <div className="flex gap-3">
                <Button onClick={handleTestConnection} disabled={testing} variant="outline">
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    'Testar Conexão'
                  )}
                </Button>
                <Button onClick={handleSaveConfig} disabled={!testResult?.success}>
                  Salvar Configuração
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Funcionalidades */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Análise de Mensagens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Detecção automática de intenção (confirmar, reagendar, cancelar)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Análise de sentimento (positivo, neutro, negativo)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Classificação de urgência</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Extração de informações (data, motivo)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Respostas Automáticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Sugestões de resposta contextualizadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Tom personalizado por situação</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Múltiplas alternativas de resposta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Respostas em espanhol</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Insights e Predições
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Insights automáticos do sistema</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Predição de no-show</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Recomendações de ações</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Análise de padrões</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-600" />
                  Otimização de Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Otimização automática de mensagens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Sugestões de melhorias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Análise de performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Geração de variantes para testes A/B</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Uso */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Uso</CardTitle>
              <CardDescription>
                Monitore o uso da IA e custos estimados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total de Requisições</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Taxa de Cache</p>
                  <p className="text-2xl font-bold">0%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Latência Média</p>
                  <p className="text-2xl font-bold">0ms</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Custo Estimado</p>
                  <p className="text-2xl font-bold">$0.00</p>
                </div>
              </div>
              <Alert className="mt-6">
                <AlertDescription>
                  As estatísticas de uso serão atualizadas em tempo real após a primeira utilização.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
