# 👥 Guia do Usuário - Odonto Chin CRM

## 🎯 Bem-vindo!

Este guia vai te ensinar a usar todas as funcionalidades do **Odonto Chin CRM** de forma rápida e prática.

---

## 🚀 Primeiros Passos

### 1. Fazer Login
1. Acesse a URL do sistema
2. Digite seu email e senha
3. Clique em **Entrar**

**Primeiro acesso?**
- Email: `admin@ortobom.com`
- Senha: `admin123`
- ⚠️ **Altere a senha imediatamente!**

### 2. Conhecer o Dashboard
Após o login, você verá:
- **Métricas principais** no topo
- **Calendário de agendamentos** no centro
- **Menu lateral** com todas as funcionalidades
- **Alertas e notificações** no canto superior direito

---

## 📋 Funcionalidades Principais

### 1. 👤 Gestão de Pacientes

#### Cadastrar Novo Paciente
1. Clique em **Pacientes** no menu
2. Clique em **Novo Paciente**
3. Preencha os dados:
   - Nome completo
   - CPF/RUT/CI
   - Data de nascimento
   - Telefone/WhatsApp
   - Email
   - Endereço
4. Clique em **Salvar**

#### Buscar Paciente
1. Use a barra de busca no topo
2. Digite nome, telefone ou documento
3. Clique no paciente para ver detalhes

#### Editar Paciente
1. Abra o perfil do paciente
2. Clique em **Editar**
3. Altere os dados necessários
4. Clique em **Salvar**

---

### 2. 📅 Agendamentos

#### Criar Agendamento
1. Clique em **Agendamentos** no menu
2. Clique em uma data no calendário
3. Preencha:
   - Paciente (busque ou crie novo)
   - Tipo de cita (Ortodoncia/Clínico General)
   - Horário
   - Cadeira (se aplicável)
   - Observações
4. Clique em **Agendar**

#### Confirmar Agendamento
1. Localize o agendamento no calendário
2. Clique nele
3. Clique em **Confirmar**
4. O status muda para "Confirmado" ✅

#### Reagendar
1. Localize o agendamento
2. Clique em **Reagendar**
3. Selecione nova data/horário
4. Clique em **Salvar**

---

### 3. 📢 Canal de Recordatórios

**O que faz:** Envia lembretes automáticos de consultas para pacientes via WhatsApp.

#### Configurar Recordatórios
1. Vá em **Canal de Recordatórios**
2. **Tab Recordatórios:**
   - Ative envio automático
   - Selecione templates
   - Configure horários (ex: 24h antes, 3h antes)
3. **Tab Integração Clínica:**
   - Conecte WhatsApp Business
   - Configure canais separados
4. **Tab Estatísticas:**
   - Monitore performance

#### Conectar WhatsApp
1. Vá em **Canal de Recordatórios** → **Integração Clínica**
2. Clique em **Conectar WhatsApp**
3. Preencha:
   - URL da Evolution API
   - Nome da instância
4. Clique em **Gerar QR Code**
5. Escaneie com seu WhatsApp Business
6. Aguarde confirmação de conexão ✅

#### Ver Estatísticas
1. Vá em **Canal de Recordatórios** → **Estatísticas**
2. Veja:
   - Total de mensagens enviadas
   - Taxa de entrega
   - Taxa de leitura
   - Taxa de confirmação
3. Analise gráficos de performance

---

### 4. 💬 Mensagens Recebidas (Inbox)

**O que faz:** Centraliza todas as mensagens recebidas dos pacientes.

#### Ver Mensagens
1. Clique em **Mensajes Recibidos**
2. Use filtros:
   - **Canal Clínica:** mensagens do WhatsApp principal
   - **Canal Recordatorios:** respostas aos lembretes
3. Clique em uma mensagem para ver detalhes

#### Responder Mensagem
1. Abra a mensagem
2. Digite sua resposta
3. Clique em **Enviar**

#### Marcar como Lida
1. Clique na mensagem
2. Ela é marcada automaticamente como lida

---

### 5. 🔄 Solicitudes de Reagendamiento

**O que faz:** Detecta automaticamente quando um paciente pede para reagendar.

#### Como Funciona
1. Paciente responde ao lembrete pedindo para reagendar
2. Sistema detecta automaticamente
3. **Alerta aparece** na tela da secretária:
   - Popup visual
   - Som de alerta
4. Informações do paciente são enviadas para WhatsApp corporativo
5. Secretária entra em contato e reagenda

#### Processar Solicitação
1. Clique no alerta
2. Veja dados do paciente
3. Entre em contato via WhatsApp
4. Reagende a consulta
5. Marque como **Resolvido**

---

### 6. 💚 Saúde dos Canais

**O que faz:** Monitora a saúde dos canais de comunicação em tempo real.

#### Ver Saúde dos Canais
1. Clique em **Saúde dos Canais**
2. Veja 2 canais:
   - **Canal Clínica** (comunicação principal)
   - **Canal Recordatorios** (lembretes em massa)
3. Métricas:
   - Taxa de entrega (verde = bom)
   - Taxa de leitura
   - Taxa de resposta
   - Tempo médio de resposta

#### Interpretar Cores
- 🟢 **Verde (80-100%):** Canal saudável
- 🟡 **Amarelo (50-79%):** Atenção necessária
- 🔴 **Vermelho (0-49%):** Problema crítico

#### Agir em Problemas
1. Se canal está vermelho:
   - Verifique conexão
   - Verifique se número foi bloqueado
   - Troque de canal temporariamente
2. Se canal está amarelo:
   - Reduza frequência de envio
   - Melhore qualidade das mensagens

---

### 7. 📊 Estatísticas de Plantillas

**O que faz:** Mostra performance de cada template de mensagem.

#### Ver Estatísticas
1. Clique em **Estadísticas de Plantillas**
2. Veja performance por:
   - Tipo de template
   - Tipo de cita
   - Taxa de confirmação
3. Identifique templates mais efetivos

#### Otimizar Templates
1. Templates com baixa performance:
   - Edite o texto
   - Teste variações
   - Monitore resultados
2. Templates com alta performance:
   - Use como referência
   - Duplique para outros tipos

---

### 8. 🧪 Tests A/B

**O que faz:** Compara diferentes versões de mensagens para ver qual funciona melhor.

#### Criar Test A/B
1. Clique em **Tests A/B**
2. Clique em **Nuevo Test**
3. Configure:
   - Nome do teste
   - Versão A (mensagem original)
   - Versão B (mensagem alternativa)
   - Público (50/50)
4. Clique em **Iniciar Test**

#### Ver Resultados
1. Aguarde pelo menos 100 envios
2. Veja qual versão teve:
   - Maior taxa de confirmação
   - Maior taxa de leitura
   - Maior taxa de resposta
3. Sistema mostra **confiança estatística**
4. Use a versão vencedora

---

### 9. 🎯 Efectividad de Recordatorios

**O que faz:** Analisa o impacto dos lembretes na taxa de comparecimento.

#### Ver Análise
1. Clique em **Efectividad de Recordatorios**
2. Veja comparação:
   - **Com recordatorios:** taxa de asistência
   - **Sin recordatorios:** taxa de asistência
3. Analise por:
   - Tipo de cita
   - Tipo de mensagem
   - Horário de envío

#### Insights Automáticos
- Sistema gera insights como:
  - "Recordatorios aumentam asistência em 35%"
  - "Melhor horário de envío: 9h"
  - "Template 'Urgente' tem maior impacto"

---

### 10. 🤖 Insights e Recomendações IA

**O que faz:** IA analisa dados e gera recomendações inteligentes.

#### Ver Insights
1. Clique em **Insights IA**
2. Veja recomendações em 7 categorias:
   - **Performance:** otimizações de performance
   - **Risco:** alertas de problemas
   - **Optimización:** melhorias sugeridas
   - **Canal:** problemas de canais
   - **Engagement:** engajamento de pacientes
   - **Oportunidad:** oportunidades de negócio
   - **General:** insights gerais

#### Aplicar Recomendações
1. Leia o insight
2. Veja prioridade (Urgente/Alta/Média/Baixa)
3. Veja confiança (% de certeza)
4. Clique em **Aplicar Ação**
5. Siga as instruções

#### Exemplo de Insight
```
🔴 URGENTE - Risco
"Canal WhatsApp Recordatorios com health score de 15%. 
Risco de bloqueio iminente."

Ação sugerida: Pausar envios por 24h e trocar para canal alternativo.
Confiança: 95%
```

---

### 11. 📉 Relatório de Inadimplência

**O que faz:** Identifica pacientes inadimplentes e sugere ações.

#### Ver Relatório
1. Clique em **Relatório de Inadimplência**
2. Veja:
   - Total de inadimplentes
   - Deuda total
   - Deuda promedio
3. Filtre por:
   - Tipo de cita
   - Nível de risco
   - Data

#### Níveis de Risco
- 🔴 **Crítico:** Dívida > 60 dias
- 🟠 **Alto:** Dívida 30-60 dias
- 🟡 **Médio:** Dívida 15-30 dias
- 🟢 **Baixo:** Dívida < 15 dias

#### Ações de Cobrança
1. Selecione paciente
2. Clique em **Contactar**
3. Escolha canal (WhatsApp/Email/Telefone)
4. Envie mensagem de cobrança
5. Marque como **Contactado**

---

### 12. 📝 Gestão de Templates

**O que faz:** Cria e gerencia templates de mensagens.

#### Criar Template
1. Clique em **Templates**
2. Clique em **Nuevo Template**
3. Preencha:
   - Nome
   - Categoria
   - Tipo de cita
   - Mensagem
4. Use variáveis:
   - `{nombre}` - Nome do paciente
   - `{fecha}` - Data da consulta
   - `{hora}` - Horário da consulta
   - `{doctor}` - Nome do doutor
5. Clique em **Salvar**

#### Editar Template
1. Localize o template
2. Clique em **Editar**
3. Altere o texto
4. Clique em **Salvar**

#### Duplicar Template
1. Localize o template
2. Clique em **Duplicar**
3. Edite conforme necessário
4. Salve com novo nome

---

### 13. ⚙️ Configurações

#### Configurações Gerais
1. Clique em **Configurações**
2. Tab **General:**
   - Altere idioma
   - Configure timezone
   - Defina moeda

#### Gestão de Usuários
1. Tab **Usuarios:**
2. Clique em **Nuevo Usuario**
3. Preencha dados
4. Selecione role:
   - **Admin:** acesso total
   - **Doctor:** acesso a pacientes e agendamentos
   - **Secretaria:** acesso a agendamentos e mensagens
   - **Gerente:** acesso a relatórios
5. Clique em **Salvar**

#### Gestão de Clínicas
1. Tab **Clínicas:**
2. Clique em **Nueva Clínica**
3. Preencha:
   - Nome
   - País
   - Endereço
   - Telefones
   - Email
   - Número de cadeiras
4. Clique em **Salvar**

#### Integrações
1. Tab **Integraciones:**
2. Conecte serviços:
   - WhatsApp Business
   - Messenger
   - n8n
   - Chatwoot
   - Email (SMTP)
3. Configure credenciais
4. Teste conexão

#### Notificações
1. Tab **Notificaciones:**
2. Ative/desative:
   - Email notifications
   - WhatsApp notifications
   - Appointment reminders
   - Rescheduling alerts
   - Channel health alerts
   - Daily reports

#### Segurança
1. Tab **Seguridad:**
2. Configure:
   - Autenticação 2FA
   - Tempo de sessão
   - Política de senhas
   - API Keys

---

## 💡 Dicas e Boas Práticas

### Para Secretárias
1. ✅ Verifique **Solicitudes de Reagendamiento** a cada hora
2. ✅ Responda mensagens em até 1 hora
3. ✅ Confirme agendamentos manualmente se paciente não responder
4. ✅ Mantenha dados de pacientes atualizados

### Para Gerentes
1. ✅ Revise **Insights IA** diariamente
2. ✅ Monitore **Saúde dos Canais** 2x ao dia
3. ✅ Analise **Relatório de Inadimplência** semanalmente
4. ✅ Otimize templates baseado em **Estatísticas**

### Para Administradores
1. ✅ Faça backup do banco de dados semanalmente
2. ✅ Monitore logs de erro
3. ✅ Atualize sistema regularmente
4. ✅ Treine novos usuários

---

## 🆘 Problemas Comuns

### "Não consigo fazer login"
**Solução:**
1. Verifique se email está correto
2. Clique em "Esqueci minha senha"
3. Siga instruções no email
4. Se não receber email, contate administrador

### "Mensagens não estão sendo enviadas"
**Solução:**
1. Verifique **Saúde dos Canais**
2. Verifique se atingiu limite diário (1000 msg/dia)
3. Verifique conexão do WhatsApp
4. Contate administrador se problema persistir

### "QR Code não aparece"
**Solução:**
1. Verifique conexão com internet
2. Recarregue a página
3. Tente novamente em 1 minuto
4. Contate administrador se problema persistir

### "Paciente não recebeu lembrete"
**Solução:**
1. Verifique se número está correto
2. Verifique se lembrete foi agendado
3. Veja logs em **Mensajes Recibidos**
4. Envie manualmente se necessário

---

## 📞 Suporte

**Dúvidas ou problemas?**
- Email: support@ortobom.com
- WhatsApp: +591 7654-3210
- Horário: Segunda a Sexta, 8h-18h

**Documentação Técnica:**
- Ver arquivo: `DOCUMENTACAO_COMPLETA.md`

---

## 🎉 Conclusão

Agora você está pronto para usar todas as funcionalidades do **Odonto Chin CRM**!

**Lembre-se:**
- Explore o sistema
- Use os insights de IA
- Monitore a saúde dos canais
- Mantenha dados atualizados

**Bom trabalho! 💪**
