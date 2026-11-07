<div align="center">

# ❄️ GELAR

### Gestão de Energia, Alertas e Refrigeração

**Mais visibilidade sobre equipamentos de refrigeração. Menos tempo para identificar problemas.**

![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/Status-Protótipo-ef4444?style=for-the-badge)

**Protótipo desenvolvido para o Hackathon ALIMENTA.**

[Funcionalidades](#-funcionalidades) · [Tecnologias](#-tecnologias) · [Como executar](#-como-executar) · [Limitações](#-escopo-do-protótipo)

</div>

---

## 💡 O problema

Em estabelecimentos que dependem de freezers e outros equipamentos de refrigeração, variações de temperatura, falhas de energia e portas deixadas abertas podem comprometer produtos, gerar desperdícios e aumentar custos operacionais.

A identificação tardia desses eventos dificulta uma resposta rápida da equipe.

## 🎯 A solução

O **GELAR** reúne informações de equipamentos de refrigeração em uma interface de acompanhamento, com foco em **identificar situações de risco e facilitar a tomada de decisão**.

A versão atual é um **protótipo demonstrativo**: os dados dos equipamentos e as ocorrências são simulados para apresentar a experiência de uso e o fluxo de alertas.

## ✨ Funcionalidades

| Módulo | O que apresenta |
| --- | --- |
| 📊 **Dashboard** | Visão geral dos equipamentos e seus estados |
| 🧊 **Equipamentos** | Listagem e acompanhamento individual dos freezers |
| 🚨 **Alertas** | Ocorrências de temperatura, energia e cenários de porta aberta |
| 🕘 **Histórico** | Consulta de ocorrências simuladas |
| 📈 **Relatórios** | Indicadores e gráficos demonstrativos |
| ⚙️ **Configurações** | Preferências da interface e parâmetros demonstrativos |
| 🖥️ **Monitor** | Tela dedicada para acompanhar os equipamentos em tempo real *dentro da simulação* |

### 🚪 Cenário de porta aberta

O fluxo planejado para a demonstração distingue uma porta recém-aberta de uma ocorrência crítica:

- **Até 1 minuto aberta:** aviso visual de atenção, sem disparo sonoro.
- **Após 1 minuto aberta:** estado crítico em vermelho e alarme sonoro na interface.
- **Ao fechar a porta:** encerramento do alerta de porta, desde que não haja outra condição crítica.

> **Observação:** o comportamento exato depende da versão do código executada no Monitor. O alarme é reproduzido pelo navegador; não é enviado a rádios ou dispositivos físicos.

## 🛠️ Tecnologias

- **React 19** — construção da interface.
- **TypeScript** — tipagem do código.
- **Vite 8** — ambiente de desenvolvimento e build.
- **Tailwind CSS 4** — estilização responsiva.
- **React Router** — navegação entre páginas.
- **Recharts** — visualização de gráficos.
- **Lucide React** — ícones da interface.
- **Oxlint** — análise estática do código.

## 🚀 Como executar

**Pré-requisito:** Node.js compatível com a versão do Vite utilizada no projeto e npm.

```bash
# Clonar o repositório
git clone https://github.com/BryanGabr/Gelar.git

# Entrar na pasta
cd Gelar

# Instalar dependências
npm install

# Iniciar o servidor local
npm run dev
```

Abra o endereço local exibido no terminal (normalmente `http://localhost:5173`).

### Outros comandos

```bash
npm run build    # Verifica TypeScript e gera a versão de produção
npm run preview  # Pré-visualiza a versão compilada
npm run lint     # Executa o Oxlint
```

## 🗂️ Organização do projeto

```text
Gelar/
├── public/             # Arquivos públicos
├── src/                # Código-fonte da aplicação
├── index.html          # Entrada HTML
├── package.json        # Dependências e scripts
├── vite.config.ts      # Configuração do Vite
└── README.md           # Documentação
```

## 🧪 Escopo do protótipo

O GELAR **ainda não é um sistema de monitoramento físico em produção**.

- Temperaturas, estados e ocorrências são **simulados**.
- Não há integração operacional confirmada com **Smart Life/Tuya**.
- O alarme sonoro do Monitor é **local ao navegador**.
- As telas não devem ser interpretadas como registros auditáveis ou dados reais de sensores.
- Preferências salvas localmente não significam configuração de equipamentos físicos.

Essa distinção é importante para apresentar o projeto com transparência durante a hackathon.

## 🧭 Próximos passos

- [ ] Validar o fluxo completo de alertas com usuários do estabelecimento.
- [ ] Avaliar a viabilidade técnica e as permissões de integração com sensores existentes.
- [ ] Centralizar o estado dos equipamentos para sincronizar Dashboard, Monitor, Alertas e Histórico.
- [ ] Persistir ocorrências e configurações em um backend.
- [ ] Implementar autenticação e perfis de acesso, se necessários.
- [ ] Estudar canais externos de notificação, incluindo a ideia de comunicação por rádio.
- [ ] Adicionar testes automatizados e documentação de implantação.

## 🤝 Contexto

Projeto concebido no contexto do **Hackathon ALIMENTA**, com foco em uma aplicação prática para acompanhamento de equipamentos de refrigeração em estabelecimentos alimentícios.

## 👨‍💻 Repositório

Mantido em [github.com/BryanGabr/Gelar](https://github.com/BryanGabr/Gelar).

---

<div align="center">
  <strong>GELAR — informação clara para agir antes que o problema aumente.</strong>
</div>
