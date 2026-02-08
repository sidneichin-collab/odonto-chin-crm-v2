# 🔒 REGRAS INQUEBRÁVEIS DO ODONTO CHIN CRM

**Versão:** 2.2.0  
**Data:** 08 de Fevereiro de 2026  
**Status:** ✅ **OBRIGATÓRIO - NÃO PODE SER VIOLADO**

---

## ⚠️ ATENÇÃO CRÍTICA

Estas regras são **INQUEBRÁVEIS** e devem ser implementadas com **100% de confiabilidade, SEM FALHAS**.

O CRM **DEVE** seguir estas regras **EXATAMENTE** como especificado. Qualquer desvio compromete a confiabilidade do sistema.

---

## 📋 ÍNDICE

1. [Regras de Recordatórios](#1-regras-de-recordatórios)
2. [Regras de Reagendamento](#2-regras-de-reagendamento)
3. [Regras de Kanban e Dashboard](#3-regras-de-kanban-e-dashboard)
4. [Regras de Confirmação](#4-regras-de-confirmação)
5. [Regras de Horários](#5-regras-de-horários)
6. [Regras de Mensagens](#6-regras-de-mensagens)

---

## 1. REGRAS DE RECORDATÓRIOS

### 1.1 Sequência de Mensagens - 2 Dias Antes

**OBRIGATÓRIO:** Enviar 3 mensagens no dia **2 dias antes** da consulta:

| Horário | Mensagem | Objetivo |
|---------|----------|----------|
| 10:00 | Primeira mensagem | Recordatório amigável |
| 15:00 | Segunda mensagem | Reforço educacional |
| 19:00 | Terceira mensagem | Reforço com autoridade (Dra.) |

**REGRA CRÍTICA:** Se o paciente **NÃO CONFIRMAR** após estas 3 mensagens, continuar para o dia seguinte (1 dia antes).

---

### 1.2 Sequência de Mensagens - 1 Dia Antes (Não Confirmados)

**OBRIGATÓRIO:** Enviar mensagens **PROGRESSIVAMENTE MAIS PERSUASIVAS**:

| Horário | Ação |
|---------|------|
| 07:00 | Mensagem 1 - Tom firme |
| 08:00 | Mensagem 2 - Reforço com urgência |
| 10:00 | Mensagem 3 - Persuasão |
| 12:00 | Mensagem 4 - Persuasão + Medo |
| 14:00 | Mensagem 5 - Persuasão + Urgência |
| 16:00 | Mensagem 6 - Persuasão + Autoridade |
| 18:00 | Mensagem 7 - Última tentativa |

**REGRA CRÍTICA:** Parar às **19:00** (não enviar após este horário).

**REGRA CRÍTICA:** Se o paciente **CONFIRMAR** em qualquer momento, **PARAR IMEDIATAMENTE** todas as mensagens de recordatório.

---

### 1.3 Sequência de Mensagens - Dia da Consulta (Não Confirmados)

**OBRIGATÓRIO:** Enviar apenas 2 mensagens:

| Horário | Mensagem | Tom |
|---------|----------|-----|
| 07:00 | Aviso final | Firme e urgente |
| 2h antes da consulta | Última tentativa | Muito firme |

**REGRA CRÍTICA:** Após estas 2 mensagens, **PARAR COMPLETAMENTE**.

---

### 1.4 Sequência de Mensagens - Pacientes Confirmados

**OBRIGATÓRIO:** Enviar mensagens **EDUCACIONAIS E MOTIVACIONAIS**:

| Quando | Horário | Mensagem | Objetivo |
|--------|---------|----------|----------|
| 1 dia antes | 10:00 | Educacional sobre manutenção | Reforçar importância |
| Dia da consulta | 07:00 | Motivacional | Encorajar presença |

**REGRA CRÍTICA:** **NÃO** enviar mensagens de recordatório persuasivas para quem já confirmou.

---

## 2. REGRAS DE REAGENDAMENTO

### 2.1 Detecção Automática

**OBRIGATÓRIO:** O CRM **DEVE** detectar automaticamente quando o paciente solicita reagendamento através das seguintes palavras-chave:

- "no pudeo"
- "no consigo"
- "reagenda"
- "reagendar"
- "para otro dia"
- "no tiene"
- "no puedo"
- "não posso"
- "não consigo"
- "outro dia"
- "mudar"
- "cambiar"

**REGRA CRÍTICA:** A detecção **DEVE** ser case-insensitive (maiúsculas/minúsculas) e **DEVE** funcionar mesmo com erros de digitação comuns.

---

### 2.2 Fluxo Automático de Reagendamento

**OBRIGATÓRIO:** Quando detectar solicitação de reagendamento, o CRM **DEVE**:

1. ✅ **Enviar mensagem automática ao paciente:**
   ```
   Nuestra secretaria entrará en contacto ahora para reagendar. Gracias!
   ```

2. ✅ **Enviar notificação para WhatsApp corporativo da clínica:**
   - Nome do paciente
   - Link do WhatsApp do paciente
   - Horário da consulta original
   - Data da consulta original

3. ✅ **Exibir popup sonoro no dashboard da secretária:**
   - **Visual:** Popup piscando (flashing)
   - **Sonoro:** Alerta audível
   - **Mensagem:** "REAGENDAMENTO SOLICITADO: [Nome do Paciente]"
   - **Ação:** Botão para abrir WhatsApp do paciente

**REGRA CRÍTICA:** **SOMENTE A SECRETÁRIA** pode reagendar. O sistema **NÃO PODE** permitir que o paciente reagende sozinho.

---

### 2.3 Proibição de Reagendamento Automático

**REGRA CRÍTICA ABSOLUTA:** O CRM **NUNCA** pode:
- ❌ Permitir que o paciente escolha nova data
- ❌ Mostrar calendário para o paciente
- ❌ Confirmar novo horário automaticamente
- ❌ Alterar agendamento sem aprovação da secretária

**MOTIVO:** Apenas a secretária tem autorização para reagendar.

---

## 3. REGRAS DE KANBAN E DASHBOARD

### 3.1 Movimentação Automática de Pacientes

**OBRIGATÓRIO:** O CRM **DEVE** mover automaticamente os pacientes entre as colunas do Kanban:

| Evento | Ação Automática | Destino |
|--------|-----------------|---------|
| Paciente confirma | Mover imediatamente | Coluna "Confirmados" |
| Paciente não confirma | Manter | Coluna "Não Confirmados" |
| Paciente solicita reagendamento | Mover | Coluna "Reagendamentos" |
| Consulta realizada | Mover | Coluna "Realizados" |

**REGRA CRÍTICA:** A movimentação **DEVE** ser **INSTANTÂNEA** (máximo 1 segundo de delay).

**REGRA CRÍTICA:** **ZERO ERROS** são permitidos na movimentação. O sistema **DEVE** ter logs de auditoria.

---

### 3.2 Estrutura do Kanban

**OBRIGATÓRIO:** O Kanban **DEVE** ter as seguintes colunas:

1. **Agendados** - Pacientes com consulta marcada
2. **Não Confirmados** - Pacientes que não responderam
3. **Confirmados** - Pacientes que confirmaram presença
4. **Reagendamentos** - Pacientes solicitando reagendamento
5. **Realizados** - Consultas concluídas
6. **Faltaram** - Pacientes que não compareceram

**REGRA CRÍTICA:** Cada paciente **DEVE** estar em **APENAS UMA** coluna por vez.

---

### 3.3 Sincronização Dashboard ↔ Kanban

**REGRA CRÍTICA ABSOLUTA:** 

> **TUDO QUE É FEITO TEM QUE APARECER NO DASHBOARD E NO KANBAN**

**OBRIGATÓRIO:** O CRM **DEVE**:
- ✅ Sincronizar em tempo real (máximo 1 segundo)
- ✅ Mostrar status atualizado em ambos
- ✅ Permitir ações em ambos (Dashboard e Kanban)
- ✅ Manter consistência de dados

**REGRA CRÍTICA:** **ZERO DIVERGÊNCIAS** entre Dashboard e Kanban são permitidas.

---

## 4. REGRAS DE CONFIRMAÇÃO

### 4.1 Detecção de Confirmação

**OBRIGATÓRIO:** O CRM **DEVE** detectar confirmação através de:

- "SÍ" (com acento)
- "SI" (sem acento)
- "si"
- "sí"
- "SIM"
- "sim"
- "OK"
- "ok"
- "confirmo"
- "confirmar"
- "estarei lá"
- "vou"

**REGRA CRÍTICA:** A detecção **DEVE** ser case-insensitive e **DEVE** funcionar mesmo com espaços extras.

---

### 4.2 Ações Após Confirmação

**OBRIGATÓRIO:** Quando o paciente confirma, o CRM **DEVE**:

1. ✅ **Parar IMEDIATAMENTE** todas as mensagens de recordatório
2. ✅ **Mover** o paciente para coluna "Confirmados" no Kanban
3. ✅ **Atualizar** status no Dashboard
4. ✅ **Registrar** horário da confirmação
5. ✅ **Enviar** mensagens educacionais (1 dia antes e dia da consulta)

**REGRA CRÍTICA:** **NUNCA** enviar mensagens de recordatório persuasivas após confirmação.

---

## 5. REGRAS DE HORÁRIOS

### 5.1 Horários Permitidos para Envio

**OBRIGATÓRIO:** O CRM **DEVE** respeitar os seguintes horários:

| Tipo de Mensagem | Horário Mínimo | Horário Máximo |
|------------------|----------------|----------------|
| Recordatórios | 07:00 | 19:00 |
| Confirmações | 07:00 | 19:00 |
| Reagendamentos | 07:00 | 19:00 |

**REGRA CRÍTICA:** **NUNCA** enviar mensagens fora deste horário (07:00 - 19:00).

---

### 5.2 Fuso Horário por Clínica

**OBRIGATÓRIO:** O CRM **DEVE** suportar múltiplos fusos horários:

| País | Fuso Horário | Exemplo |
|------|--------------|---------|
| Bolívia | America/La_Paz | GMT-4 |
| Paraguai | America/Asuncion | GMT-4 |
| Chile | America/Santiago | GMT-3 |
| Panamá | America/Panama | GMT-5 |

**REGRA CRÍTICA:** Cada clínica **DEVE** ter seu fuso horário configurado corretamente.

---

## 6. REGRAS DE MENSAGENS

### 6.1 Personalização Obrigatória

**OBRIGATÓRIO:** Todas as mensagens **DEVEM** incluir:

- ✅ Nome do paciente
- ✅ Saudação apropriada ao horário
- ✅ Nome da clínica (ex: ORTOBOM ODONTOLOGÍA)
- ✅ Data da consulta
- ✅ Horário da consulta
- ✅ Menção à "Dra." (sem nome específico)

**REGRA CRÍTICA:** **NUNCA** enviar mensagens genéricas sem personalização.

---

### 6.2 Saudações por Horário

**OBRIGATÓRIO:** O CRM **DEVE** usar saudações apropriadas:

| Horário | Saudação (Espanhol) | Saudação (Português) |
|---------|---------------------|----------------------|
| 05:00 - 11:59 | Buenos días | Bom dia |
| 12:00 - 18:59 | Buenas tardes | Boa tarde |
| 19:00 - 04:59 | Buenas noches | Boa noite |

**REGRA CRÍTICA:** A saudação **DEVE** ser baseada no horário **da clínica** (fuso horário local).

---

### 6.3 Progressão de Tom

**OBRIGATÓRIO:** As mensagens **DEVEM** seguir esta progressão:

| Tentativa | Tom | Elementos |
|-----------|-----|-----------|
| 1ª | Amigável | Saudação, recordatório simples |
| 2ª | Educacional | Importância da manutenção |
| 3ª | Firme | Autoridade (Dra.), consequências |
| 4ª+ | Persuasivo + Urgente | Medo, urgência, autoridade |

**REGRA CRÍTICA:** **NUNCA** começar com tom agressivo. A progressão **DEVE** ser gradual.

---

## 7. REGRAS DE CONFIABILIDADE

### 7.1 Logs de Auditoria

**OBRIGATÓRIO:** O CRM **DEVE** registrar:

- ✅ Todas as mensagens enviadas (timestamp, destinatário, conteúdo)
- ✅ Todas as confirmações recebidas (timestamp, remetente, resposta)
- ✅ Todas as movimentações no Kanban (timestamp, origem, destino)
- ✅ Todas as solicitações de reagendamento (timestamp, paciente)
- ✅ Todos os erros e falhas (timestamp, tipo, detalhes)

**REGRA CRÍTICA:** Logs **DEVEM** ser imutáveis e armazenados por no mínimo 1 ano.

---

### 7.2 Validações Obrigatórias

**OBRIGATÓRIO:** Antes de enviar qualquer mensagem, o CRM **DEVE** validar:

1. ✅ Paciente tem WhatsApp válido
2. ✅ Consulta está agendada
3. ✅ Horário de envio está dentro do permitido (07:00 - 19:00)
4. ✅ Paciente não confirmou ainda (para recordatórios)
5. ✅ Paciente não solicitou reagendamento
6. ✅ Mensagem está personalizada corretamente

**REGRA CRÍTICA:** **NUNCA** enviar mensagem sem passar por todas as validações.

---

### 7.3 Tratamento de Erros

**OBRIGATÓRIO:** Se ocorrer erro ao enviar mensagem, o CRM **DEVE**:

1. ✅ Registrar erro no log
2. ✅ Tentar reenviar após 5 minutos (máximo 3 tentativas)
3. ✅ Notificar secretária se falhar após 3 tentativas
4. ✅ **NUNCA** marcar como "enviado" se falhou

**REGRA CRÍTICA:** **ZERO TOLERÂNCIA** para mensagens marcadas como enviadas quando não foram.

---

## 8. REGRAS DE IDENTIFICAÇÃO

### 8.1 Identificação de Clínica

**OBRIGATÓRIO:** Cada clínica **DEVE** ter:

- ✅ ID único
- ✅ Nome (ex: "ORTOBOM ODONTOLOGÍA")
- ✅ País
- ✅ Fuso horário
- ✅ WhatsApp corporativo
- ✅ Email

**REGRA CRÍTICA:** Todas as mensagens **DEVEM** incluir o nome da clínica correta.

---

### 8.2 Identificação de Paciente

**OBRIGATÓRIO:** Cada paciente **DEVE** ter:

- ✅ Nome completo
- ✅ WhatsApp
- ✅ Email (opcional)
- ✅ Clínica associada
- ✅ Histórico de confirmações
- ✅ Status atual (Agendado, Confirmado, etc.)

**REGRA CRÍTICA:** **NUNCA** confundir pacientes de clínicas diferentes.

---

## 9. REGRAS DE PERFORMANCE

### 9.1 Tempo de Resposta

**OBRIGATÓRIO:** O CRM **DEVE** responder:

| Ação | Tempo Máximo |
|------|--------------|
| Detecção de confirmação | 1 segundo |
| Movimentação no Kanban | 1 segundo |
| Atualização no Dashboard | 1 segundo |
| Detecção de reagendamento | 2 segundos |
| Popup de alerta | 1 segundo |

**REGRA CRÍTICA:** **NUNCA** ultrapassar estes tempos de resposta.

---

### 9.2 Escalabilidade

**OBRIGATÓRIO:** O CRM **DEVE** suportar:

- ✅ 50+ clínicas simultâneas
- ✅ 10.000+ pacientes ativos
- ✅ 1.000+ mensagens por hora
- ✅ 100+ usuários simultâneos

**REGRA CRÍTICA:** Performance **NÃO PODE** degradar com aumento de carga.

---

## 10. CHECKLIST DE VALIDAÇÃO

### Antes de Considerar o CRM Pronto

- [ ] Todas as mensagens seguem a sequência correta
- [ ] Horários são respeitados (07:00 - 19:00)
- [ ] Confirmações param mensagens imediatamente
- [ ] Reagendamentos geram popup sonoro
- [ ] Kanban e Dashboard sincronizam em tempo real
- [ ] Logs de auditoria funcionando
- [ ] Validações implementadas
- [ ] Tratamento de erros funcionando
- [ ] Múltiplos fusos horários suportados
- [ ] Personalização de mensagens funcionando
- [ ] Testes automatizados passando 100%

---

## ✅ CONCLUSÃO

Estas regras são **INQUEBRÁVEIS** e **OBRIGATÓRIAS**.

O CRM **DEVE** ser uma ferramenta de **EXTREMA CONFIABILIDADE**.

**ZERO ERROS** são aceitáveis nas funcionalidades críticas:
- Envio de mensagens
- Detecção de confirmações
- Movimentação no Kanban
- Reagendamentos

---

**Versão:** 2.2.0  
**Status:** ✅ **OBRIGATÓRIO**  
**Prioridade:** 🔴 **CRÍTICA**  
**Tolerância a Falhas:** ❌ **ZERO**

---

**Desenvolvido por:** Manus AI Agent  
**Data:** 08/02/2026  
**Aprovação:** Obrigatória para produção
