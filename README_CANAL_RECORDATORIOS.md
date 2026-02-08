# 📢 Canal de Recordatórios - Odonto Chin CRM

**Sistema de gestão inteligente de canais de comunicação para recordatórios de consultas odontológicas**

---

## 🎯 Visão Geral

O **Canal de Recordatórios** é uma funcionalidade completa integrada ao Odonto Chin CRM que permite gerenciar múltiplos canais de comunicação (WhatsApp, Messenger, n8n, Chatwoot) com sistema anti-bloqueio inteligente, monitoramento de saúde automático e rotação de canais.

### ✨ Principais Funcionalidades

1. **Gestão de Múltiplos Canais**
   - WhatsApp (via Evolution API)
   - Facebook Messenger
   - n8n (automação)
   - Chatwoot (atendimento)

2. **Sistema Anti-Bloqueio**
   - Limite diário de 1000 mensagens por canal
   - Intervalo mínimo de 3 segundos entre mensagens
   - Rotação automática entre canais
   - Auto-pause em caso de problemas

3. **Monitoramento de Saúde**
   - Health score em tempo real (0-100%)
   - Indicadores visuais (verde/amarelo/vermelho)
   - Histórico de saúde por 90 dias
   - Alertas automáticos

4. **Integração Evolution API**
   - Geração de QR Code para pareamento
   - Verificação de status de conexão
   - Envio de mensagens de teste
   - Webhook para eventos

5. **Serviços Automáticos**
   - Monitor de saúde (executa a cada 5 minutos)
   - Reset diário de contadores (à meia-noite)
   - Limpeza automática de dados antigos

---

## 🏗️ Arquitetura

### Frontend (React + TypeScript)

```
client/src/
├── pages/
│   └── CanalRecordatorios.tsx    # Página principal
├── components/
│   └── DashboardLayout.tsx       # Layout com menu
└── App.tsx                       # Rotas configuradas
```

### Backend (Node.js + tRPC)

```
server/
├── routers-canal-recordatorios.ts  # 40+ endpoints tRPC
├── db-canal-recordatorios.ts       # Funções de banco
└── services/
    ├── channel-health-monitor.ts   # Monitor de saúde
    ├── daily-reset-service.ts      # Reset diário
    └── index.ts                    # Inicialização
```

### Banco de Dados (MySQL)

```
drizzle/
├── schema-canal-recordatorios.ts   # Schema TypeScript
└── migrations/
    └── 0001_canal_recordatorios.sql # Migration SQL
```

**5 Tabelas:**
1. `communicationChannels` - Configuração de canais
2. `channelMessagesLog` - Log de mensagens
3. `channelHealthHistory` - Histórico de saúde
4. `channelAntiblockConfig` - Configurações anti-bloqueio
5. `channelAlerts` - Alertas do sistema

**Stored Procedures:**
- `sp_reset_daily_message_counters()` - Reset diário
- `sp_update_channel_health(channel_id)` - Atualização de saúde

**View:**
- `v_channel_statistics` - Estatísticas em tempo real

**Triggers:**
- `trg_update_channel_message_count` - Atualiza contador ao enviar mensagem

---

## 🚀 Instalação

### Pré-requisitos

- Node.js 22.x
- MySQL 8.x
- pnpm
- PM2 (para produção)

### Passo a Passo

1. **Clonar/Extrair Projeto**

```bash
cd /var/www
tar -xzf odonto-crm-FINAL-completo-20260207-184531.tar.gz
cd odonto-crm
```

2. **Instalar Dependências**

```bash
# Servidor
pnpm install

# Cliente
cd client
pnpm install
cd ..
```

3. **Configurar Variáveis de Ambiente**

```bash
cp .env.example .env
nano .env
```

```env
DATABASE_URL=mysql://user:pass@localhost:3306/odonto_chin_crm
EVOLUTION_API_URL=https://95.111.240.243
EVOLUTION_API_KEY=OdontoChinSecretKey2026
ENCRYPTION_KEY=sua-chave-super-secreta-aqui
PORT=5000
NODE_ENV=production
```

4. **Aplicar Migration**

```bash
mysql -u root -p odonto_chin_crm < drizzle/migrations/0001_canal_recordatorios.sql
```

5. **Build**

```bash
# Cliente
cd client
pnpm run build
cd ..

# Servidor (se necessário)
pnpm run build
```

6. **Iniciar**

```bash
# Desenvolvimento
pnpm run dev

# Produção
pm2 start ecosystem.config.js
```

---

## 📖 Uso

### Acessar Interface

```
https://seu-dominio.com/canal-recordatorios
```

### Conectar Novo Canal

1. Clicar em "Nuevo Canal" no card do tipo desejado
2. Preencher formulário:
   - **Nome da Conexão:** Ex: "WhatsApp Bolivia 1"
   - **Propósito:** Recordatórios ou Integração Clínica
   - **Identificador:** Número de telefone (WhatsApp)
   - **API URL:** https://95.111.240.243 (Evolution API)
   - **API Key:** Sua chave da Evolution API
   - **Limite Diário:** 1000 (padrão)
3. Clicar em "Guardar"
4. Gerar QR Code (para WhatsApp)
5. Escanear QR Code no celular
6. Aguardar conexão

### Enviar Mensagem de Teste

1. Na lista de canais, clicar em "Probar"
2. Inserir número de destino
3. Clicar em "Enviar Prueba"
4. Verificar se mensagem foi entregue

### Monitorar Saúde

- **Verde (80-100%):** Canal saudável
- **Amarelo (50-79%):** Atenção necessária
- **Vermelho (0-49%):** Canal com problemas

### Visualizar Estatísticas

1. Clicar na tab "Estadísticas"
2. Ver gráficos de:
   - Mensagens enviadas por dia
   - Taxa de entrega
   - Saúde dos canais
   - Alertas ativos

---

## 🔧 API (tRPC)

### Endpoints Principais

#### Canais

```typescript
// Listar canais
trpc.canalRecordatorios.channels.list.query({ purpose: 'reminders' })

// Criar canal
trpc.canalRecordatorios.channels.create.mutate({
  channelType: 'whatsapp',
  channelPurpose: 'reminders',
  connectionName: 'WhatsApp Test',
  apiUrl: 'https://95.111.240.243',
  apiKey: 'sua-chave',
  dailyLimit: 1000
})

// Atualizar canal
trpc.canalRecordatorios.channels.update.mutate({
  id: 1,
  status: 'active'
})

// Deletar canal
trpc.canalRecordatorios.channels.delete.mutate({ id: 1 })

// Definir como padrão
trpc.canalRecordatorios.channels.setDefault.mutate({ id: 1 })
```

#### Saúde

```typescript
// Obter saúde
trpc.canalRecordatorios.health.getChannelHealth.query({ channelId: 1 })

// Histórico
trpc.canalRecordatorios.health.getHealthHistory.query({ 
  channelId: 1, 
  hours: 24 
})

// Estatísticas globais
trpc.canalRecordatorios.health.getGlobalStats.query()
```

#### Mensagens

```typescript
// Listar mensagens
trpc.canalRecordatorios.messages.list.query({ 
  channelId: 1, 
  limit: 50 
})

// Registrar mensagem
trpc.canalRecordatorios.messages.log.mutate({
  channelId: 1,
  messageType: 'reminder_1day',
  recipientNumber: '+591XXXXXXXX',
  messageContent: 'Sua consulta é amanhã!',
  status: 'sent'
})

// Atualizar status
trpc.canalRecordatorios.messages.updateStatus.mutate({
  id: 1,
  status: 'delivered'
})
```

#### Anti-Bloqueio

```typescript
// Verificar se pode enviar
trpc.canalRecordatorios.antiblock.canSendMessage.query({ channelId: 1 })

// Obter próximo canal disponível
trpc.canalRecordatorios.antiblock.getNextAvailableChannel.query({ 
  purpose: 'reminders' 
})

// Obter configuração
trpc.canalRecordatorios.antiblock.getConfig.query({ channelId: 1 })

// Atualizar configuração
trpc.canalRecordatorios.antiblock.updateConfig.mutate({
  channelId: 1,
  dailyLimit: 1500,
  minIntervalSeconds: 5
})
```

#### Evolution API

```typescript
// Gerar QR Code
trpc.canalRecordatorios.evolution.generateQRCode.mutate({ channelId: 1 })

// Verificar conexão
trpc.canalRecordatorios.evolution.checkConnection.query({ channelId: 1 })

// Enviar mensagem de teste
trpc.canalRecordatorios.evolution.sendTestMessage.mutate({
  channelId: 1,
  recipientNumber: '+591XXXXXXXX',
  message: 'Teste do sistema'
})
```

---

## 🔒 Segurança

### Criptografia

Todas as API keys e access tokens são criptografados usando AES-256-CBC antes de serem armazenados no banco de dados.

```typescript
// Exemplo de uso interno
const encrypted = encrypt('minha-api-key-secreta');
// Retorna: "iv:encrypted_data"

const decrypted = decrypt(encrypted);
// Retorna: "minha-api-key-secreta"
```

### Variáveis de Ambiente

**NUNCA** commitar o arquivo `.env` no Git. Use `.env.example` como template.

---

## 📊 Monitoramento

### Serviços Automáticos

#### Monitor de Saúde

- **Frequência:** A cada 5 minutos
- **Função:** Verifica saúde de todos os canais ativos
- **Ações:**
  - Calcula health score (0-100%)
  - Registra histórico
  - Cria alertas se necessário
  - Auto-pause em caso crítico (< 20%)

#### Reset Diário

- **Frequência:** Todos os dias à meia-noite (00:00)
- **Função:** Reseta contadores diários
- **Ações:**
  - Zera `messages_sent_today`
  - Limpa alertas resolvidos antigos (> 30 dias)
  - Limpa histórico de saúde antigo (> 90 dias)

### Logs

```bash
# Ver logs em tempo real
pm2 logs odonto-crm

# Filtrar por serviço
pm2 logs odonto-crm | grep "Health Monitor"
pm2 logs odonto-crm | grep "Daily Reset"

# Ver apenas erros
pm2 logs odonto-crm --err
```

### Alertas

O sistema cria alertas automaticamente para:

- **health_critical:** Health score < 20%
- **health_low:** Health score < 50%
- **low_delivery_rate:** Taxa de entrega < 70%
- **limit_approaching:** Uso > 90% do limite diário
- **connection_lost:** Perda de conexão com Evolution API

---

## 🧪 Testes

Consulte o arquivo `GUIA_TESTES.md` para guia completo de testes.

### Testes Rápidos

```bash
# Testar conexão com banco
mysql -u root -p odonto_chin_crm -e "SELECT COUNT(*) FROM communicationChannels;"

# Testar endpoint tRPC
curl http://localhost:5000/trpc/canalRecordatorios.health.getGlobalStats

# Testar Evolution API
curl https://95.111.240.243/health
```

---

## 📚 Documentação Adicional

- **GUIA_DEPLOY_DIGITALOCEAN.md** - Deploy passo a passo
- **GUIA_TESTES.md** - Testes completos
- **CANAL_RECORDATORIOS_ESPECIFICACAO_TECNICA.md** - Especificação técnica original
- **RESUMO_IMPLEMENTACOES.md** - Resumo das implementações

---

## 🐛 Troubleshooting

### Problema: Canal não conecta

**Solução:**
1. Verificar credenciais da Evolution API
2. Testar conectividade: `curl https://95.111.240.243/health`
3. Gerar novo QR Code
4. Verificar logs: `pm2 logs odonto-crm`

### Problema: Mensagens não enviam

**Solução:**
1. Verificar health score do canal
2. Verificar limite diário não atingido
3. Verificar intervalo mínimo respeitado
4. Testar com `canSendMessage` endpoint

### Problema: Health score sempre 0

**Solução:**
1. Verificar se monitor de saúde está rodando
2. Executar manualmente: `CALL sp_update_channel_health(1);`
3. Verificar logs de mensagens no banco

---

## 🔄 Atualizações Futuras

### Planejadas

- [ ] Suporte para Telegram
- [ ] Dashboard de analytics avançado
- [ ] Exportação de relatórios em PDF
- [ ] Integração com Google Calendar
- [ ] Notificações por email
- [ ] API REST adicional (além de tRPC)

### Sugestões

Envie suas sugestões via GitHub Issues ou contato direto.

---

## 👥 Contribuidores

- **Desenvolvedor:** Manus AI
- **Cliente:** Odonto Chin
- **Data:** 07 de fevereiro de 2026

---

## 📄 Licença

Propriedade de Odonto Chin. Todos os direitos reservados.

---

## 📞 Suporte

Para suporte técnico:

1. Verificar documentação completa
2. Consultar guias de troubleshooting
3. Verificar logs do sistema
4. Contatar desenvolvedor

---

**🎉 Sistema pronto para uso em produção!**

**Versão:** 1.0  
**Última atualização:** 07 de fevereiro de 2026
