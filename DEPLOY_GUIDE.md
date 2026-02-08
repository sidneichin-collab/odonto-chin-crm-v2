# 🚀 Guia Completo de Deploy - Odonto Chin CRM

**Versão:** 2.1.0  
**Data:** 08 de Fevereiro de 2026  
**Plataforma:** DigitalOcean / Contabo / Qualquer VPS Linux

---

## 📋 Índice

1. [Requisitos](#requisitos)
2. [Preparação do Servidor](#preparação-do-servidor)
3. [Deploy Automático](#deploy-automático)
4. [Deploy Manual](#deploy-manual)
5. [Configuração SSL](#configuração-ssl)
6. [Backup e Restore](#backup-e-restore)
7. [Monitoramento](#monitoramento)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos

### Servidor Mínimo
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disco:** 20 GB SSD
- **OS:** Ubuntu 20.04+ / Debian 11+
- **Porta:** 80, 443, 3306 abertas

### Servidor Recomendado
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disco:** 50 GB SSD
- **OS:** Ubuntu 22.04 LTS

### Software Necessário
- Docker 20.10+
- Docker Compose 2.0+
- Git (opcional)

---

## 🖥️ Preparação do Servidor

### 1. Conectar ao Servidor

```bash
ssh root@seu-servidor-ip
```

### 2. Atualizar Sistema

```bash
apt-get update
apt-get upgrade -y
apt-get install -y curl wget git
```

### 3. Configurar Firewall (UFW)

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## 🚀 Deploy Automático (Recomendado)

### Opção 1: Upload do Pacote

1. **Fazer upload do arquivo tar.gz para o servidor:**

```bash
scp odonto-crm-fixed.tar.gz root@seu-servidor-ip:/root/
```

2. **No servidor, extrair e executar:**

```bash
cd /root
tar -xzf odonto-crm-fixed.tar.gz
cd odonto-crm-fixed
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

### Opção 2: Clone do Repositório (se usar Git)

```bash
cd /opt
git clone https://seu-repositorio.git odonto-crm
cd odonto-crm
chmod +x scripts/deploy.sh
sudo ./scripts/deploy.sh
```

### O Script Fará Automaticamente:

✅ Instalar Docker e Docker Compose  
✅ Criar diretórios necessários  
✅ Configurar variáveis de ambiente  
✅ Construir containers  
✅ Iniciar serviços  
✅ Configurar backup automático  

**Tempo estimado:** 10-15 minutos

---

## 🔨 Deploy Manual

### 1. Instalar Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker
```

### 2. Instalar Docker Compose

```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 3. Criar Diretório da Aplicação

```bash
mkdir -p /opt/odonto-crm
cd /opt/odonto-crm
```

### 4. Copiar Arquivos

```bash
# Upload via SCP ou copiar manualmente
scp -r odonto-crm-fixed/* root@servidor:/opt/odonto-crm/
```

### 5. Configurar Variáveis de Ambiente

```bash
cd /opt/odonto-crm
cp .env.production .env
nano .env
```

**Editar as seguintes variáveis:**

```env
# Senhas do banco de dados
MYSQL_ROOT_PASSWORD=SuaSenhaRootSegura123!
MYSQL_PASSWORD=SuaSenhaUserSegura456!

# Session secret (gerar com: openssl rand -base64 32)
SESSION_SECRET=sua-chave-secreta-gerada

# Encryption key (32 caracteres)
ENCRYPTION_KEY=sua-chave-de-32-caracteres-aqui

# OpenAI (opcional)
OPENAI_API_KEY=sk-...

# Domínio
DOMAIN=seu-dominio.com
```

### 6. Construir e Iniciar

```bash
docker-compose build
docker-compose up -d
```

### 7. Verificar Status

```bash
docker-compose ps
docker-compose logs -f
```

---

## 🔒 Configuração SSL (HTTPS)

### Opção 1: Let's Encrypt (Gratuito)

```bash
# Instalar Certbot
apt-get install -y certbot

# Parar nginx temporariamente
docker-compose stop nginx

# Obter certificado
certbot certonly --standalone -d seu-dominio.com

# Copiar certificados
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem nginx/ssl/

# Editar nginx.conf e descomentar seção HTTPS
nano nginx/nginx.conf

# Reiniciar nginx
docker-compose up -d nginx
```

### Opção 2: Certificado Próprio

```bash
# Gerar certificado autoassinado (apenas para testes)
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/privkey.pem \
    -out nginx/ssl/fullchain.pem
```

### Renovação Automática (Let's Encrypt)

```bash
# Adicionar ao crontab
crontab -e

# Adicionar linha:
0 3 * * * certbot renew --quiet && docker-compose restart nginx
```

---

## 💾 Backup e Restore

### Backup Manual

```bash
# Executar backup imediatamente
docker-compose run --rm backup

# Verificar backups
ls -lh backups/
```

### Backup Automático

**Já configurado!** Roda diariamente às 2h da manhã.

**Localização:** `/opt/odonto-crm/backups/`  
**Retenção:** 30 dias (configurável em `.env`)

### Restore de Backup

```bash
# Parar aplicação
docker-compose stop app

# Restaurar banco de dados
gunzip < backups/odonto_crm_backup_YYYYMMDD_HHMMSS.sql.gz | \
    docker-compose exec -T mysql mysql -u odonto_user -p odonto_crm

# Reiniciar aplicação
docker-compose start app
```

### Backup Completo do Sistema

```bash
# Backup de tudo (código + banco + dados)
cd /opt
tar -czf odonto-crm-full-backup-$(date +%Y%m%d).tar.gz odonto-crm/

# Download para sua máquina local
scp root@servidor:/opt/odonto-crm-full-backup-*.tar.gz ./
```

---

## 📊 Monitoramento

### Ver Logs em Tempo Real

```bash
# Todos os serviços
docker-compose logs -f

# Apenas aplicação
docker-compose logs -f app

# Apenas banco de dados
docker-compose logs -f mysql

# Apenas nginx
docker-compose logs -f nginx
```

### Status dos Containers

```bash
docker-compose ps
```

### Uso de Recursos

```bash
docker stats
```

### Health Check

```bash
# Verificar se aplicação está saudável
curl http://localhost/health

# Verificar banco de dados
docker-compose exec mysql mysqladmin ping -h localhost
```

---

## 🔄 Comandos Úteis

### Gerenciamento de Containers

```bash
# Parar tudo
docker-compose down

# Iniciar tudo
docker-compose up -d

# Reiniciar serviço específico
docker-compose restart app

# Reconstruir após mudanças
docker-compose up -d --build

# Ver logs
docker-compose logs -f app
```

### Acesso ao Banco de Dados

```bash
# Conectar ao MySQL
docker-compose exec mysql mysql -u odonto_user -p odonto_crm

# Dump do banco
docker-compose exec mysql mysqldump -u odonto_user -p odonto_crm > backup.sql
```

### Limpeza

```bash
# Remover containers parados
docker-compose down

# Remover volumes (CUIDADO: apaga dados!)
docker-compose down -v

# Limpar imagens antigas
docker system prune -a
```

---

## 🐛 Troubleshooting

### Problema: Containers não iniciam

**Solução:**
```bash
# Ver logs detalhados
docker-compose logs

# Verificar portas em uso
netstat -tulpn | grep -E '(80|443|3306|5000)'

# Parar serviços conflitantes
systemctl stop apache2  # se existir
systemctl stop mysql    # se existir
```

### Problema: Banco de dados não conecta

**Solução:**
```bash
# Verificar se MySQL está rodando
docker-compose ps mysql

# Ver logs do MySQL
docker-compose logs mysql

# Testar conexão
docker-compose exec mysql mysqladmin ping -h localhost
```

### Problema: Aplicação retorna erro 502

**Solução:**
```bash
# Verificar se app está rodando
docker-compose ps app

# Ver logs da aplicação
docker-compose logs app

# Reiniciar aplicação
docker-compose restart app
```

### Problema: Sem espaço em disco

**Solução:**
```bash
# Ver uso de disco
df -h

# Limpar logs antigos
docker-compose exec app sh -c "find /app/logs -type f -mtime +7 -delete"

# Limpar backups antigos
find /opt/odonto-crm/backups -type f -mtime +30 -delete

# Limpar Docker
docker system prune -a
```

### Problema: Backup não está rodando

**Solução:**
```bash
# Verificar crontab
crontab -l

# Testar backup manualmente
docker-compose run --rm backup

# Ver logs de backup
cat /var/log/odonto-crm-backup.log
```

---

## 🔐 Segurança

### Checklist de Segurança

- [ ] Alterar todas as senhas padrão em `.env`
- [ ] Configurar SSL/HTTPS
- [ ] Configurar firewall (UFW)
- [ ] Desabilitar login root via SSH
- [ ] Configurar fail2ban
- [ ] Manter sistema atualizado
- [ ] Backups automáticos funcionando
- [ ] Monitorar logs regularmente

### Configurar Fail2Ban

```bash
apt-get install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

### Desabilitar Login Root

```bash
# Criar usuário admin
adduser admin
usermod -aG sudo admin

# Editar SSH config
nano /etc/ssh/sshd_config

# Alterar:
PermitRootLogin no

# Reiniciar SSH
systemctl restart sshd
```

---

## 📞 Suporte

### Logs Importantes

- **Aplicação:** `/opt/odonto-crm/app_logs/`
- **Nginx:** `/opt/odonto-crm/nginx_logs/`
- **Backup:** `/var/log/odonto-crm-backup.log`
- **Docker:** `docker-compose logs`

### Informações do Sistema

```bash
# Versão do CRM
cat /opt/odonto-crm/package.json | grep version

# Informações do servidor
uname -a
docker --version
docker-compose --version
```

---

## ✅ Checklist Pós-Deploy

- [ ] Aplicação acessível via HTTP
- [ ] SSL configurado (HTTPS)
- [ ] Banco de dados funcionando
- [ ] Backup automático configurado
- [ ] Logs sendo gerados
- [ ] Health checks passando
- [ ] Firewall configurado
- [ ] Domínio apontando para servidor
- [ ] Senhas alteradas
- [ ] Documentação revisada

---

## 🎉 Pronto!

Seu **Odonto Chin CRM** está agora rodando em produção! 🚀

**URL:** https://seu-dominio.com

**Próximos Passos:**
1. Criar primeiro usuário admin
2. Configurar integrações (WhatsApp, IA)
3. Importar dados de pacientes
4. Treinar equipe

---

**Desenvolvido por:** Manus AI Agent  
**Versão:** 2.1.0  
**Data:** 08/02/2026
