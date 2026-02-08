# 🧪 Guia de Testes - Canal de Recordatórios

**Sistema:** Odonto Chin CRM  
**Data:** 07 de fevereiro de 2026  
**Versão:** 1.0

---

## 📋 Checklist de Testes

### ✅ Fase 1: Testes de Interface (Frontend)

#### 1.1 Navegação
- [ ] Menu sidebar exibe item "Canal Recordatórios"
- [ ] Ícone Megaphone aparece corretamente
- [ ] Click no item navega para `/canal-recordatorios`
- [ ] Página carrega sem erros no console
- [ ] Layout responsivo (desktop/tablet/mobile)

#### 1.2 Estatísticas Globais (Header)
- [ ] Card "Canales Activos" exibe número
- [ ] Card "Mensajes Hoy" exibe contador
- [ ] Card "Salud Promedio" exibe porcentagem
- [ ] Card "Alertas Activas" exibe número

#### 1.3 Sistema de Tabs
- [ ] Tab "Canal de Recordatórios" ativa por padrão
- [ ] Tab "Canal Integración Clínica" funciona
- [ ] Tab "Estadísticas" funciona
- [ ] Conteúdo muda ao trocar tabs

#### 1.4 Cards de Canais Disponíveis
- [ ] Card WhatsApp (verde) aparece
- [ ] Card Messenger (azul) aparece
- [ ] Card n8n (roxo) aparece
- [ ] Card Chatwoot (laranja) aparece
- [ ] Botão "Nuevo Canal" funciona

#### 1.5 Modal de Conexão
- [ ] Modal abre ao clicar "Nuevo Canal"
- [ ] Formulário exibe campos corretos
- [ ] Seletor de tipo de canal funciona
- [ ] Seletor de propósito funciona
- [ ] Campos obrigatórios validam
- [ ] Botão "Guardar" funciona
- [ ] Botão "Cancelar" fecha modal
- [ ] Modal fecha ao salvar

#### 1.6 Lista de Canais Conectados
- [ ] Tabela exibe canais (se houver)
- [ ] Coluna "Status" mostra indicador visual
- [ ] Coluna "Salud" exibe barra de progresso
- [ ] Cores corretas (verde/amarelo/vermelho)
- [ ] Progresso de uso diário funciona
- [ ] Botões de ação aparecem

---

### ✅ Fase 2: Testes de Backend (tRPC)

#### 2.1 Endpoints de Canais
```bash
# Testar via curl ou Postman

# Listar canais
curl http://localhost:5000/trpc/canalRecordatorios.channels.list

# Criar canal
curl -X POST http://localhost:5000/trpc/canalRecordatorios.channels.create \
  -H "Content-Type: application/json" \
  -d '{
    "channelType": "whatsapp",
    "channelPurpose": "reminders",
    "connectionName": "WhatsApp Test",
    "dailyLimit": 1000
  }'

# Buscar por ID
curl http://localhost:5000/trpc/canalRecordatorios.channels.getById?id=1

# Atualizar
curl -X POST http://localhost:5000/trpc/canalRecordatorios.channels.update \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "status": "active"
  }'

# Deletar
curl -X POST http://localhost:5000/trpc/canalRecordatorios.channels.delete \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

#### 2.2 Endpoints de Saúde
```bash
# Obter saúde de um canal
curl http://localhost:5000/trpc/canalRecordatorios.health.getChannelHealth?channelId=1

# Obter histórico
curl http://localhost:5000/trpc/canalRecordatorios.health.getHealthHistory?channelId=1&hours=24

# Forçar atualização
curl -X POST http://localhost:5000/trpc/canalRecordatorios.health.updateHealth \
  -H "Content-Type: application/json" \
  -d '{"channelId": 1}'

# Estatísticas globais
curl http://localhost:5000/trpc/canalRecordatorios.health.getGlobalStats
```

#### 2.3 Endpoints de Mensagens
```bash
# Listar mensagens
curl http://localhost:5000/trpc/canalRecordatorios.messages.list?channelId=1&limit=10

# Registrar mensagem
curl -X POST http://localhost:5000/trpc/canalRecordatorios.messages.log \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": 1,
    "messageType": "reminder_1day",
    "recipientNumber": "+591XXXXXXXX",
    "messageContent": "Test message",
    "status": "sent"
  }'

# Atualizar status
curl -X POST http://localhost:5000/trpc/canalRecordatorios.messages.updateStatus \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "status": "delivered"
  }'
```

#### 2.4 Endpoints Anti-Bloqueio
```bash
# Obter config
curl http://localhost:5000/trpc/canalRecordatorios.antiblock.getConfig?channelId=1

# Verificar se pode enviar
curl http://localhost:5000/trpc/canalRecordatorios.antiblock.canSendMessage?channelId=1

# Obter próximo canal disponível
curl http://localhost:5000/trpc/canalRecordatorios.antiblock.getNextAvailableChannel?purpose=reminders
```

---

### ✅ Fase 3: Testes de Banco de Dados

#### 3.1 Verificar Tabelas Criadas
```sql
-- Conectar no MySQL
mysql -u root -p odonto_chin_crm

-- Verificar tabelas
SHOW TABLES LIKE 'communication%';
SHOW TABLES LIKE 'channel%';

-- Deve retornar:
-- communicationChannels
-- channelMessagesLog
-- channelHealthHistory
-- channelAntiblockConfig
-- channelAlerts
```

#### 3.2 Testar Stored Procedures
```sql
-- Reset de contadores
CALL sp_reset_daily_message_counters();

-- Verificar se resetou
SELECT id, connection_name, messages_sent_today 
FROM communicationChannels;

-- Atualizar saúde de um canal
CALL sp_update_channel_health(1);

-- Verificar health score
SELECT id, connection_name, health_score, last_health_check_at 
FROM communicationChannels 
WHERE id = 1;
```

#### 3.3 Testar View de Estatísticas
```sql
-- Ver estatísticas em tempo real
SELECT * FROM v_channel_statistics;

-- Deve retornar:
-- channel_id, connection_name, channel_type, status, health_score,
-- messages_sent_today, daily_limit, usage_percent, total_messages_24h,
-- delivered_messages_24h, failed_messages_24h, delivery_rate_24h
```

#### 3.4 Testar Triggers
```sql
-- Inserir mensagem de teste
INSERT INTO channelMessagesLog (
  channel_id, message_type, recipient_number, 
  message_content, status
) VALUES (
  1, 'reminder_1day', '+591XXXXXXXX', 
  'Test message', 'sent'
);

-- Verificar se contador foi atualizado
SELECT id, messages_sent_today, last_message_at 
FROM communicationChannels 
WHERE id = 1;

-- Contador deve ter aumentado em 1
```

---

### ✅ Fase 4: Testes de Integração Evolution API

#### 4.1 Verificar Conexão
```bash
# Testar conexão com Evolution API
curl https://95.111.240.243/health

# Deve retornar status 200
```

#### 4.2 Gerar QR Code
```bash
# Via tRPC endpoint
curl -X POST http://localhost:5000/trpc/canalRecordatorios.evolution.generateQRCode \
  -H "Content-Type: application/json" \
  -d '{"channelId": 1}'

# Deve retornar:
# {
#   "qrCode": "data:image/png;base64,...",
#   "instanceName": "odonto-chin-1"
# }
```

#### 4.3 Verificar Status de Conexão
```bash
curl -X GET http://localhost:5000/trpc/canalRecordatorios.evolution.checkConnection?channelId=1

# Deve retornar:
# {
#   "connected": true/false,
#   "state": "open"/"closed"
# }
```

#### 4.4 Enviar Mensagem de Teste
```bash
curl -X POST http://localhost:5000/trpc/canalRecordatorios.evolution.sendTestMessage \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": 1,
    "recipientNumber": "+591XXXXXXXX",
    "message": "Mensaje de prueba del sistema Odonto Chin CRM"
  }'

# Deve retornar:
# {
#   "success": true,
#   "messageId": "..."
# }
```

---

### ✅ Fase 5: Testes de Serviços Automáticos

#### 5.1 Monitor de Saúde
```bash
# Verificar se serviço está rodando
ps aux | grep "channel-health-monitor"

# Verificar logs
tail -f /var/log/odonto-crm/health-monitor.log

# Deve aparecer:
# [Health Monitor] Starting...
# [Health Monitor] Checking X active channels...
# [Health Monitor] Channel 1 (WhatsApp Test): Health=100%, Delivered=X/Y
```

#### 5.2 Serviço de Reset Diário
```bash
# Verificar se serviço está rodando
ps aux | grep "daily-reset-service"

# Verificar logs
tail -f /var/log/odonto-crm/daily-reset.log

# Deve aparecer:
# [Daily Reset] Starting...
# [Daily Reset] Next reset scheduled for 2026-02-08T00:00:00Z
```

#### 5.3 Testar Reset Manual
```bash
# Conectar no MySQL
mysql -u root -p odonto_chin_crm

# Inserir contador de teste
UPDATE communicationChannels 
SET messages_sent_today = 500 
WHERE id = 1;

# Executar reset
CALL sp_reset_daily_message_counters();

# Verificar se resetou
SELECT id, messages_sent_today FROM communicationChannels WHERE id = 1;
-- Deve retornar 0
```

---

### ✅ Fase 6: Testes de Sistema Anti-Bloqueio

#### 6.1 Testar Limite Diário
```sql
-- Configurar limite baixo para teste
UPDATE communicationChannels 
SET daily_limit = 5, messages_sent_today = 0 
WHERE id = 1;

-- Tentar enviar 6 mensagens
-- (usar endpoint de envio 6 vezes)

-- Verificar se bloqueou na 6ª
SELECT can_send_message(1);
-- Deve retornar FALSE
```

#### 6.2 Testar Intervalo Mínimo
```sql
-- Enviar mensagem
-- Tentar enviar outra imediatamente
-- Deve retornar erro: "Minimum interval not reached"

-- Aguardar 3 segundos
-- Tentar novamente
-- Deve funcionar
```

#### 6.3 Testar Auto-Pause
```sql
-- Forçar health score baixo
UPDATE communicationChannels 
SET health_score = 15 
WHERE id = 1;

-- Executar health check
CALL sp_update_channel_health(1);

-- Verificar se pausou
SELECT id, status, error_message 
FROM communicationChannels 
WHERE id = 1;
-- Status deve ser 'error'
-- error_message deve conter "Auto-paused"
```

#### 6.4 Testar Rotação de Canais
```sql
-- Criar 2 canais
INSERT INTO communicationChannels (...) VALUES (...); -- Canal 1
INSERT INTO communicationChannels (...) VALUES (...); -- Canal 2

-- Forçar Canal 1 com health baixo
UPDATE communicationChannels SET health_score = 40 WHERE id = 1;

-- Forçar Canal 2 com health alto
UPDATE communicationChannels SET health_score = 95 WHERE id = 2;

-- Obter próximo canal disponível
-- Deve retornar Canal 2
```

---

### ✅ Fase 7: Testes de Alertas

#### 7.1 Verificar Criação de Alertas
```sql
-- Listar alertas
SELECT * FROM channelAlerts 
ORDER BY created_at DESC 
LIMIT 10;

-- Verificar tipos de alerta:
-- - health_critical
-- - health_low
-- - low_delivery_rate
-- - limit_approaching
-- - connection_lost
```

#### 7.2 Testar Resolução de Alertas
```bash
# Via tRPC
curl -X POST http://localhost:5000/trpc/canalRecordatorios.alerts.resolve \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "resolution": "Problema resolvido manualmente"
  }'

# Verificar no banco
SELECT * FROM channelAlerts WHERE id = 1;
-- resolved deve ser TRUE
-- resolved_at deve ter timestamp
```

---

### ✅ Fase 8: Testes de Criptografia

#### 8.1 Verificar Criptografia de API Keys
```sql
-- Inserir canal com API key
-- (via tRPC endpoint create)

-- Verificar no banco
SELECT id, connection_name, api_key_encrypted 
FROM communicationChannels 
WHERE id = 1;

-- api_key_encrypted deve estar criptografado (formato: "iv:encrypted")
-- NÃO deve ser texto plano
```

#### 8.2 Verificar Descriptografia
```bash
# Buscar canal via tRPC
curl http://localhost:5000/trpc/canalRecordatorios.channels.getById?id=1

# Response deve conter:
# {
#   "apiKey": "OdontoChinSecretKey2026",  // Descriptografado
#   "apiKeyEncrypted": "..."               // Criptografado no banco
# }
```

---

## 🎯 Resultados Esperados

### Frontend
- ✅ Página carrega em < 2 segundos
- ✅ Sem erros no console do navegador
- ✅ Interface responsiva em todos os dispositivos
- ✅ Todos os botões e modais funcionam

### Backend
- ✅ Todos os endpoints tRPC respondem
- ✅ Validação de dados funciona
- ✅ Erros retornam mensagens claras

### Banco de Dados
- ✅ Todas as tabelas criadas
- ✅ Stored procedures executam sem erros
- ✅ Triggers ativam corretamente
- ✅ View retorna dados corretos

### Integração Evolution API
- ✅ QR Code gerado com sucesso
- ✅ Conexão verificada corretamente
- ✅ Mensagens enviadas com sucesso

### Serviços Automáticos
- ✅ Monitor de saúde executa a cada 5 min
- ✅ Reset diário agendado para meia-noite
- ✅ Alertas criados automaticamente
- ✅ Auto-pause funciona quando necessário

### Sistema Anti-Bloqueio
- ✅ Limite diário respeitado
- ✅ Intervalo mínimo respeitado
- ✅ Rotação de canais funciona
- ✅ Health score calculado corretamente

---

## 🐛 Troubleshooting

### Problema: Página não carrega
**Solução:**
```bash
# Verificar build
cd /var/www/odonto-crm
pnpm run build

# Verificar logs
pm2 logs odonto-crm --lines 100
```

### Problema: Endpoints tRPC não respondem
**Solução:**
```bash
# Verificar se servidor está rodando
pm2 status

# Reiniciar
pm2 restart odonto-crm

# Verificar porta
netstat -tulpn | grep 5000
```

### Problema: Tabelas não existem
**Solução:**
```bash
# Reaplicar migration
mysql -u root -p odonto_chin_crm < /var/www/odonto-crm/drizzle/migrations/0001_canal_recordatorios.sql

# Verificar
mysql -u root -p odonto_chin_crm -e "SHOW TABLES;"
```

### Problema: Evolution API não responde
**Solução:**
```bash
# Verificar se API está online
curl https://95.111.240.243/health

# Verificar credenciais no código
grep -r "OdontoChinSecretKey2026" /var/www/odonto-crm/
```

### Problema: Serviços não iniciam
**Solução:**
```bash
# Verificar logs do sistema
journalctl -u odonto-crm -f

# Verificar se módulo foi importado
grep -r "startAllServices" /var/www/odonto-crm/server/
```

---

## ✅ Checklist Final

Antes de considerar os testes completos:

- [ ] Todos os testes de interface passaram
- [ ] Todos os endpoints tRPC funcionam
- [ ] Banco de dados está correto
- [ ] Evolution API integrada
- [ ] Serviços automáticos rodando
- [ ] Sistema anti-bloqueio funciona
- [ ] Alertas sendo criados
- [ ] Criptografia funciona
- [ ] Documentação completa
- [ ] Backup criado

---

**🎉 Testes Completos! Sistema pronto para produção.**
