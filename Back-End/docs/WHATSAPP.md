# Notificações por WhatsApp — CUIDA

Fluxo: `POST /api/whatsapp/notificar-disponibilidade` → `Favorito.buscarInteressados()` → **fila** (1 envio por vez, com intervalos aleatórios) → Evolution API → resultado por cidadão em `GET /api/whatsapp/notificacoes/:id`.

## Arquivos

| Arquivo | Função |
|---|---|
| `src/utils/telefone.js` | Higieniza o telefone BR → `55 + DDD + 9 dígitos` e gera as variantes com/sem o 9º dígito |
| `src/utils/mensagens.js` | Monta o texto com variações (saudação, corpo, orientação, rodapé) |
| `src/utils/logger.js` | Log JSON de uma linha, com telefone mascarado |
| `src/services/whatsappService.js` | Cliente da Evolution (v1/v2): estado da instância, verificação de número, envio, classificação de erro, retentativa |
| `src/services/filaNotificacao.js` | Fila global em memória, anti-banimento, janela de horário, relatório por lote |
| `src/middlewares/chaveInternaMiddleware.js` | Exige `x-api-key` nas rotas de disparo em massa (se `NOTIFICACAO_API_KEY` estiver definida) |
| `scripts/testar-whatsapp.js` | Teste ponta a ponta direto na Evolution |
| `test/*.test.js` | Testes automáticos (`npm test`) com uma Evolution falsa, sem WhatsApp de verdade |

## 1. Telefone

`normalizarTelefoneBR()` aceita qualquer formatação digitada — `(14) 99876-5432`, `+55 14 99876 5432`, `014 9876-5432`, `0 15 14 99876-5432` (código de operadora) — e:

1. remove tudo que não é dígito e os zeros à esquerda;
2. remove o DDI 55 e o código de operadora, se houver;
3. valida o DDD contra a lista da Anatel;
4. celular com 8 dígitos (começa com 6–9) → **adiciona o 9**; fixo (2–5) é aceito como `tipo: 'fixo'`;
5. rejeita números "fake" (`99999-9999`).

**O 9º dígito:** algumas contas antigas continuam registradas no WhatsApp **sem** o 9 (comum em DDDs fora de SP/RJ). Por isso o serviço pergunta à Evolution (`POST /chat/whatsappNumbers/{instancia}`) quais das duas variantes existem e envia exatamente para o JID devolvido. O resultado mostra `ajuste_9_digito: true` quando isso acontece. Se o endpoint de verificação não estiver disponível, envia para o formato canônico com 9.

Recomendação: aplique a mesma função no cadastro (`Cliente.createCliente` / atualização) e grave o telefone já normalizado.

## 2. Anti-banimento

| Medida | Padrão | Variável |
|---|---|---|
| Um envio por vez para o servidor inteiro (fila global) | — | — |
| Intervalo aleatório entre mensagens | 8–20 s | `WHATSAPP_INTERVALO_MIN_MS` / `MAX` |
| Pausa longa a cada N envios | a cada 15, 1–3 min | `WHATSAPP_PAUSA_A_CADA`, `WHATSAPP_PAUSA_MIN_MS` / `MAX` |
| "Digitando..." antes de enviar | 1,5–4 s | `WHATSAPP_DIGITANDO_MIN_MS` / `MAX` |
| Janela de horário (Brasília) | 8h–20h | `WHATSAPP_HORA_INICIO` / `FIM` (0 e 24 desligam) |
| Não envia para número sem WhatsApp | ligado | `WHATSAPP_VERIFICAR_NUMERO` |
| Deduplica telefones no mesmo lote | — | — |
| Texto variado (primeiro nome, 5×4×3×2 = 120 combinações) | — | — |

Com os padrões, ~100 avisos levam ~30–40 min — é intencional.

O que mais pesa para não ser banido, além do código:
- **Número dedicado e "aquecido"**: chip novo não deve disparar centenas de mensagens no primeiro dia. Comece com poucas dezenas por dia e aumente aos poucos.
- **Só mande para quem pediu** (quem favoritou) e deixe claro como parar — o rodapé da mensagem já diz para remover o favorito no app. Denúncias de "spam" são a causa nº 1 de banimento.
- **Não use truques** como caracteres invisíveis ou emojis aleatórios para "variar" o texto.
- Para volume alto ou uso oficial de um órgão público, avalie a **API oficial do WhatsApp Business (Cloud API)** com templates aprovados — a Evolution/Baileys usa o WhatsApp Web e não tem garantia contra bloqueio.

## 3. Erros e resultado

Cada cidadão recebe um `whatsapp.status`:

| status | significado |
|---|---|
| `enviado` | aceito pela Evolution (`id_mensagem` preenchido) |
| `falhou` | tentou e deu erro — ver `codigo` |
| `ignorado` | nem tentou: `SEM_TELEFONE`, `NUMERO_INVALIDO`, `DDD_INVALIDO`, `DUPLICADO` |
| `nao_enviado` | WhatsApp interrompido no lote (instância caiu, apikey errada, API fora) |

Códigos de erro (`codigo`):

| código | causa | o que o sistema faz |
|---|---|---|
| `SEM_WHATSAPP` | número não tem WhatsApp | segue para o próximo |
| `INSTANCIA_DESCONECTADA` | sessão caiu / celular deslogado | **interrompe o WhatsApp do lote** (e-mails continuam) |
| `INSTANCIA_INEXISTENTE` | `WHATSAPP_INSTANCE` errado | interrompe |
| `NAO_AUTORIZADO` | `WHATSAPP_API_KEY` errada | interrompe |
| `ERRO_REDE` | API fora do ar / DNS | 3 tentativas com backoff, depois interrompe |
| `LIMITE_TAXA` | 429 | 3 tentativas com backoff |
| `TIMEOUT` | sem resposta a tempo | **não repete** (a mensagem pode ter saído; repetir poderia duplicar) |
| `ERRO_API` | outro erro HTTP | 502/503/504 são repetidos; o resto não |

Os logs saem em JSON com telefone mascarado (`5514*****5432`) e sem o texto da mensagem — o fato de alguém esperar um medicamento é dado de saúde (LGPD). Filtrar: `npm start | grep notificacao.`

## 4. Testes

### 4.1 Automáticos (sem WhatsApp)

```bash
cd Back-End
npm test
```

Sobe uma Evolution falsa e cobre: envio ok, JID sem o 9, sem WhatsApp, inválido, duplicado, instância caindo no meio do lote, instância desconectada, apikey errada e API fora do ar.

### 4.2 Evolution local (Docker)

Use a **v2**: em 30/09/2026 ela conectou e enviou de verdade; a v1 (1.8.7) foi recusada pelo WhatsApp ("couldn't link device").

```bash
docker compose -f docs/docker-compose.evolution.yml --profile v2 up -d
docker logs --tail 30 evolution_v2     # pronto quando aparecer "HTTP - ON: 8080"
```

No `.env`: `EVOLUTION_API_VERSION=v2` e `WHATSAPP_API_KEY` **igual** a `AUTHENTICATION_API_KEY` do compose (`cuida-api-sla-2026`). Chave diferente = `NAO_AUTORIZADO` (401).

Conectar o número de teste (use um chip de teste ou WhatsApp Business, não o pessoal):

- **Pelo painel (mais fácil):** abra `http://localhost:8080/manager`, entre com a chave, crie a instância `cuida` (canal Baileys) e clique para gerar o QR.
- **Pelo PowerShell:**

```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8080/instance/create" -Headers @{apikey="cuida-api-sla-2026"} -ContentType "application/json" -Body '{"instanceName":"cuida","integration":"WHATSAPP-BAILEYS","qrcode":true}' | ConvertTo-Json -Depth 5

$r = Invoke-RestMethod -Uri "http://localhost:8080/instance/connect/cuida" -Headers @{apikey="cuida-api-sla-2026"}
$b64 = $r.base64 -replace '^data:image/png;base64,', ''
[IO.File]::WriteAllBytes("$PWD\qr.png", [Convert]::FromBase64String($b64))
start qr.png

# Conferir: "state" tem que ser "open"
Invoke-RestMethod -Uri "http://localhost:8080/instance/connectionState/cuida" -Headers @{apikey="cuida-api-sla-2026"} | ConvertTo-Json
```

No celular: WhatsApp (ou Business) → ⋮ → Dispositivos conectados → Conectar dispositivo. O QR expira em ~40 s. Várias tentativas seguidas fazem o WhatsApp responder "try again later": espere alguns minutos.

Desligar: `docker compose -f docs/docker-compose.evolution.yml --profile v2 down` (a sessão fica salva no Postgres; ao subir de novo, não precisa ler o QR).

Problemas já vistos:

| Sintoma | Causa | Solução |
|---|---|---|
| `pull access denied for atendai/evolution-api` | o repositório antigo da imagem foi apagado | a imagem agora é `evoapicloud/evolution-api` (já corrigido no compose) |
| 401 `Unauthorized` | chave do `.env` diferente da do compose | deixar as duas iguais |
| "couldn't link device" no celular | v1 desatualizada | usar a v2 |
| `Token already exists` ao criar na v1 | sobra dentro da imagem v1 | usar a v2, ou passar `"token"` próprio no create |

### 4.3 Script direto na Evolution

No **PowerShell**, chame com `node` direto. O `npm run testar:whatsapp -- ...` perde o `--enviar`, porque o PowerShell trata o `--` de um jeito especial.

```bash
node scripts/testar-whatsapp.js "(14) 99999-9999"                     # só diagnostica
node scripts/testar-whatsapp.js "(14) 99999-9999" --enviar            # envia um teste
node scripts/testar-whatsapp.js "(14) 99999-9999" --enviar --modelo   # envia o aviso real
```

Troque o número pelo celular que vai **receber** (não o conectado). Ele mostra: configuração → estado da instância → higienização → verificação → envio.

### 4.4 Pelo back-end (curl / Insomnia)

No Insomnia, crie uma requisição e cole qualquer um destes curl na barra de URL — ele importa método, headers e body.
Se `NOTIFICACAO_API_KEY` estiver vazia, pode omitir o header `x-api-key`.

```bash
# Instância conectada?
curl http://localhost:3000/api/whatsapp/status -H "x-api-key: SUA_CHAVE"

# Testar só a higienização + verificação (não envia nada)
curl -X POST http://localhost:3000/api/whatsapp/validar-numero \
  -H "Content-Type: application/json" -H "x-api-key: SUA_CHAVE" \
  -d '{"numero":"(14) 9876-5432"}'

# Disparo real para os inscritos — responde 202 com o id do lote
curl -X POST http://localhost:3000/api/whatsapp/notificar-disponibilidade \
  -H "Content-Type: application/json" -H "x-api-key: SUA_CHAVE" \
  -d '{"id_medicamento":1,"id_unidade":1}'

# Acompanhar o lote
curl http://localhost:3000/api/whatsapp/notificacoes/<id_lote> -H "x-api-key: SUA_CHAVE"

# Com poucos inscritos, dá para esperar o resultado na mesma chamada
curl -X POST http://localhost:3000/api/whatsapp/notificar-disponibilidade \
  -H "Content-Type: application/json" -H "x-api-key: SUA_CHAVE" \
  -d '{"id_medicamento":1,"id_unidade":1,"aguardar":true}'

# Envio avulso (exige login: Bearer token do /api/clientes/login)
curl -X POST http://localhost:3000/api/whatsapp/enviar \
  -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"numero":"(14) 99999-9999","mensagem":"Teste CUIDA"}'
```

Para testar o disparo em massa com segurança: crie um cliente de teste com o seu número, favorite um medicamento numa unidade e use esses ids. Para testar fora do horário comercial, ponha `WHATSAPP_HORA_INICIO=0` e `WHATSAPP_HORA_FIM=24`; para não esperar 8–20 s entre mensagens em teste, reduza `WHATSAPP_INTERVALO_*`.

Exemplo de resposta de `GET /notificacoes/:id`:

```json
{
  "success": true,
  "lote": {
    "id": "67b7fb4a-...",
    "status": "concluido",
    "total": 4,
    "motivo_interrupcao": null,
    "itens": [
      { "id_cliente": 1, "nome": "Maria da Silva", "telefone": "5514*****5432",
        "whatsapp": { "status": "enviado", "id_mensagem": "3EB0...", "numero_usado": "5514*****5432", "ajuste_9_digito": false },
        "email": { "status": "enviado" } },
      { "id_cliente": 2, "telefone": "5531*****4321",
        "whatsapp": { "status": "enviado", "numero_usado": "5531****4321", "ajuste_9_digito": true },
        "email": { "status": "sem_email" } },
      { "id_cliente": 3, "whatsapp": { "status": "falhou", "codigo": "SEM_WHATSAPP" }, "email": { "status": "enviado" } },
      { "id_cliente": 4, "whatsapp": { "status": "ignorado", "codigo": "NUMERO_INVALIDO" }, "email": { "status": "sem_email" } }
    ],
    "resumo": {
      "whatsapp": { "enviado": 2, "falhou": 1, "ignorado": 1, "nao_enviado": 0, "pendente": 0 },
      "falhas_por_codigo": { "SEM_WHATSAPP": 1, "NUMERO_INVALIDO": 1 },
      "emails_enviados": 2
    }
  }
}
```

## 5. Limitações e próximos passos

- A fila é **em memória**: reiniciar o servidor perde lotes em andamento e o histórico. Para produção, trocar por BullMQ + Redis (as funções `processarLote` e `enviarWhatsappItem` continuam as mesmas) ou gravar os resultados numa tabela `notificacao_envio` no Supabase — isso também evita avisar a mesma pessoa duas vezes se o endpoint for chamado de novo para o mesmo medicamento/unidade.
- `enviado` significa "aceito pela Evolution". Para saber se foi **entregue/lido**, configure o webhook da Evolution (`MESSAGES_UPDATE`) apontando para o back-end.
- Rode apenas **uma** instância do back-end enquanto a fila for em memória; com várias réplicas cada uma teria sua própria fila.
