# 🚀 Guia de Deploy - DigitalOcean

**Sistema:** Odonto Chin CRM - Canal de Recordatórios  
**Data:** 07 de fevereiro de 2026  
**Versão:** 1.0

---

## 📦 Arquivos Incluídos

Este pacote contém:

1. ✅ **Bug do cadastro de pacientes CORRIGIDO**
2. ✅ **Funcionalidade completa de Canal de Recordatórios**
3. ✅ **Sistema anti-bloqueio implementado**
4. ✅ **Integração com Evolution API**
5. ✅ **Serviços automáticos de monitoramento**
6. ✅ **Documentação completa**

---

## 🔧 Pré-requisitos

Antes de começar o deploy, certifique-se de ter:

- [ ] Acesso SSH ao droplet DigitalOcean
- [ ] Node.js 22.x instalado
- [ ] MySQL/MariaDB rodando
- [ ] PM2 instalado globalmente
- [ ] Nginx configurado (opcional, para proxy reverso)
- [ ] Credenciais da Evolution API

---

## 📋 Passo a Passo do Deploy

### 1. Conectar no Droplet

```bash
# Conectar via SSH
ssh root@SEU_IP_DO_DROPLET

# Ou se usar usuário não-root
ssh seu_usuario@SEU_IP_DO_DROPLET
```

### 2. Fazer Backup do Sistema Atual

```bash
# Ir para o diretório do projeto atual
cd /var/www/odonto-crm

# Criar backup completo
tar -czf ~/backup-odonto-crm-$(date +%Y%m%d-%H%M%S).tar.gz .

# Verificar backup criado
ls -lh ~/backup-odonto-crm-*.tar.gz
```

### 3. Parar Serviços Atuais

```bash
# Parar PM2
pm2 stop odonto-crm

# Verificar status
pm2 status
```

### 4. Fazer Upload do Novo Código

**Opção A: Via SCP (do seu computador)**

```bash
# No seu computador local
scp odonto-crm-FINAL-completo-20260207-184531.tar.gz root@SEU_IP:/tmp/

# Conectar no servidor
ssh root@SEU_IP

# Extrair
cd /var/www/odonto-crm
tar -xzf /tmp/odonto-crm-FINAL-completo-20260207-184531.tar.gz --strip-components=1
```

**Opção B: Via Git (se usar repositório)**

```bash
cd /var/www/odonto-crm
git pull origin main
```

### 5. Instalar Dependências

```bash
cd /var/www/odonto-crm

# Instalar dependências do servidor
pnpm install

# Instalar dependências do cliente
cd client
pnpm install
cd ..
```

### 6. Configurar Variáveis de Ambiente

```bash
# Editar .env
nano .env
```

Adicionar/verificar:

```env
# Database
DATABASE_URL=mysql://usuario:senha@localhost:3306/odonto_chin_crm

# Evolution API
EVOLUTION_API_URL=https://95.111.240.243
EVOLUTION_API_KEY=OdontoChinSecretKey2026

# Encryption (gerar nova chave segura)
ENCRYPTION_KEY=sua-chave-super-secreta-aqui-2026

# Server
PORT=5000
NODE_ENV=production

# Frontend
VITE_API_URL=https://seu-dominio.com
```

**⚠️ IMPORTANTE:** Gere uma nova `ENCRYPTION_KEY` segura:

```bash
# Gerar chave aleatória
openssl rand -base64 32
```

### 7. Aplicar Migrations do Banco de Dados

```bash
# Conectar no MySQL
mysql -u root -p odonto_chin_crm

# Aplicar migration
source /var/www/odonto-crm/drizzle/migrations/0001_canal_recordatorios.sql

# Verificar tabelas criadas
SHOW TABLES LIKE 'communication%';
SHOW TABLES LIKE 'channel%';

# Sair do MySQL
exit
```

**Tabelas que devem existir:**
- `communicationChannels`
- `channelMessagesLog`
- `channelHealthHistory`
- `channelAntiblockConfig`
- `channelAlerts`

### 8. Build do Projeto

```bash
cd /var/www/odonto-crm

# Build do cliente
cd client
pnpm run build
cd ..

# Build do servidor (se necessário)
pnpm run build
```

### 9. Iniciar Serviços Automáticos

```bash
# Editar arquivo principal do servidor
nano server/index.ts
```

Adicionar no final (antes de `app.listen()`):

```typescript
// Iniciar serviços automáticos do Canal de Recordatórios
import { startAllServices } from './services';
startAllServices();
```

### 10. Iniciar Aplicação

```bash
# Iniciar com PM2
pm2 start ecosystem.config.js

# Ou se não tiver ecosystem.config.js
pm2 start server/index.ts --name odonto-crm --interpreter node

# Verificar status
pm2 status

# Ver logs
pm2 logs odonto-crm --lines 50
```

### 11. Configurar PM2 para Iniciar no Boot

```bash
# Salvar configuração atual
pm2 save

# Gerar script de startup
pm2 startup

# Executar o comando que o PM2 mostrar
# Exemplo: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### 12. Configurar Nginx (Opcional)

```bash
# Editar configuração do Nginx
nano /etc/nginx/sites-available/odonto-crm
```

Adicionar:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend (arquivos estáticos)
    location / {
        root /var/www/odonto-crm/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # tRPC endpoints
    location /trpc {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/odonto-crm /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### 13. Configurar SSL com Let's Encrypt (Opcional)

```bash
# Instalar certbot
apt install certbot python3-certbot-nginx

# Obter certificado
certbot --nginx -d seu-dominio.com

# Renovação automática já está configurada
```

---

## ✅ Verificação Pós-Deploy

### 1. Verificar Aplicação Rodando

```bash
# Verificar PM2
pm2 status

# Ver logs em tempo real
pm2 logs odonto-crm

# Verificar porta
netstat -tulpn | grep 5000
```

### 2. Testar Frontend

```bash
# Acessar no navegador
https://seu-dominio.com

# Ou via curl
curl -I https://seu-dominio.com
```

### 3. Testar Backend

```bash
# Testar endpoint de saúde
curl http://localhost:5000/health

# Testar tRPC
curl http://localhost:5000/trpc/canalRecordatorios.health.getGlobalStats
```

### 4. Verificar Banco de Dados

```bash
mysql -u root -p odonto_chin_crm -e "
  SELECT COUNT(*) as total_channels 
  FROM communicationChannels;
"
```

### 5. Verificar Serviços Automáticos

```bash
# Ver logs do monitor de saúde
pm2 logs odonto-crm | grep "Health Monitor"

# Deve aparecer:
# [Health Monitor] Starting...
# [Health Monitor] Checking X active channels...
```

### 6. Testar Funcionalidade de Canal

1. Acessar: `https://seu-dominio.com/canal-recordatorios`
2. Clicar em "Nuevo Canal"
3. Preencher formulário
4. Salvar
5. Verificar se aparece na lista

---

## 🔧 Troubleshooting

### Problema: PM2 não inicia

```bash
# Ver logs detalhados
pm2 logs odonto-crm --lines 100 --err

# Verificar se porta está em uso
lsof -i :5000

# Matar processo na porta
kill -9 $(lsof -t -i:5000)

# Reiniciar
pm2 restart odonto-crm
```

### Problema: Erro de conexão com banco

```bash
# Verificar se MySQL está rodando
systemctl status mysql

# Testar conexão
mysql -u root -p -e "SELECT 1;"

# Verificar credenciais no .env
cat /var/www/odonto-crm/.env | grep DATABASE_URL
```

### Problema: Migration falhou

```bash
# Verificar erro
mysql -u root -p odonto_chin_crm

# Dropar tabelas se necessário (CUIDADO!)
DROP TABLE IF EXISTS channelAlerts;
DROP TABLE IF EXISTS channelHealthHistory;
DROP TABLE IF EXISTS channelMessagesLog;
DROP TABLE IF EXISTS channelAntiblockConfig;
DROP TABLE IF EXISTS communicationChannels;

# Reaplicar migration
source /var/www/odonto-crm/drizzle/migrations/0001_canal_recordatorios.sql;
```

### Problema: Frontend não carrega

```bash
# Verificar build
cd /var/www/odonto-crm/client
ls -la dist/

# Rebuild
pnpm run build

# Verificar Nginx
nginx -t
systemctl status nginx
```

### Problema: Evolution API não responde

```bash
# Testar conectividade
curl -v https://95.111.240.243/health

# Verificar API key no código
grep -r "EVOLUTION_API_KEY" /var/www/odonto-crm/

# Verificar .env
cat /var/www/odonto-crm/.env | grep EVOLUTION
```

---

## 📊 Monitoramento

### Logs em Tempo Real

```bash
# Logs gerais
pm2 logs odonto-crm

# Apenas erros
pm2 logs odonto-crm --err

# Últimas 100 linhas
pm2 logs odonto-crm --lines 100
```

### Métricas do Sistema

```bash
# Status PM2
pm2 status

# Monit (CPU/Memory)
pm2 monit

# Informações detalhadas
pm2 info odonto-crm
```

### Logs do Nginx

```bash
# Access log
tail -f /var/log/nginx/access.log

# Error log
tail -f /var/log/nginx/error.log
```

### Logs do MySQL

```bash
# Error log
tail -f /var/log/mysql/error.log

# Slow query log (se habilitado)
tail -f /var/log/mysql/slow-query.log
```

---

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode voltar para a versão anterior:

```bash
# Parar serviço atual
pm2 stop odonto-crm

# Remover código novo
cd /var/www/odonto-crm
rm -rf *

# Restaurar backup
tar -xzf ~/backup-odonto-crm-YYYYMMDD-HHMMSS.tar.gz

# Reinstalar dependências
pnpm install
cd client && pnpm install && cd ..

# Rebuild
pnpm run build
cd client && pnpm run build && cd ..

# Reiniciar
pm2 restart odonto-crm
```

---

## 🎯 Checklist Final

Antes de considerar o deploy completo:

- [ ] Backup do sistema anterior criado
- [ ] Novo código extraído corretamente
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Migration aplicada com sucesso
- [ ] Build executado sem erros
- [ ] PM2 iniciado e rodando
- [ ] Frontend acessível
- [ ] Backend respondendo
- [ ] Banco de dados funcionando
- [ ] Serviços automáticos rodando
- [ ] Nginx configurado (se aplicável)
- [ ] SSL configurado (se aplicável)
- [ ] Testes básicos executados
- [ ] Logs monitorados por 10 minutos

---

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs: `pm2 logs odonto-crm`
2. Verificar status: `pm2 status`
3. Verificar banco: `mysql -u root -p odonto_chin_crm`
4. Consultar guia de testes: `GUIA_TESTES.md`

---

## 🎉 Deploy Completo!

Após seguir todos os passos, o sistema estará rodando com:

✅ Bug do cadastro de pacientes corrigido  
✅ Canal de Recordatórios funcionando  
✅ Sistema anti-bloqueio ativo  
✅ Monitoramento automático de saúde  
✅ Integração com Evolution API  
✅ Reset diário de contadores  

**Acesse:** `https://seu-dominio.com/canal-recordatorios`

---

**Desenvolvido por:** Manus AI  
**Data:** 07 de fevereiro de 2026
