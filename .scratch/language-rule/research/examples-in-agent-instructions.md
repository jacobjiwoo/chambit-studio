# 에이전트 지침 파일에 예시를 넣을 것인가

- 조사일: 2026-10-30
- 대상: chambit-studio의 `.claude/rules/*.md`, `CLAUDE.md`, 앞으로 쓸 SKILL.md 전반. 직접 계기는 always-loaded rule `.claude/rules/language.md`
- 질문: CLAUDE.md · AGENTS.md · rules · SKILL.md · Cursor rules 같은 에이전트 지침 파일에 예시(few-shot, "X 말고 Y" 대조표)를 넣어야 하는가? 넣는다면 몇 개를, 어떤 형태로? 상시 로드되는 파일의 context 비용, 예시가 좁아서 생기는 overfitting·복사, 코드베이스가 바뀌면서 예시가 낡는 문제를 일급 실무자들은 어떻게 다루는가?

---

## 결론 요약

| 쟁점 | 판정 | 근거 (자세한 내용은 아래 절) |
|---|---|---|
| **예시를 넣는 것 자체** | **넣는다. 단, 규칙만으로 판단이 갈리는 곳에 한해서** | Anthropic은 예시를 "가장 믿을 만한" steering 수단 중 하나로 본다(§1-1). pstack은 "lint로 못 바꾸고 판단이 필요한 교훈이면 실패 사례 예시를 붙여라"라고 한다(§3-2). 반대로 Claude가 이미 아는 것에 예시를 붙이는 것은 no-op이다(§1-2, §2-1, §3-1). |
| **개수** | **본문 인라인은 소수(대략 3–5개 안쪽), 많으면 별도 파일로 뺀다** | Anthropic 프롬프트 가이드의 권장은 3–5개(§1-1). 실제 SKILL.md들도 본문에는 짧은 인라인 예시 몇 개만 두고, 큰 예시 묶음은 `tests.md`·`EXAMPLES.md` 같은 별도 파일로 뺀다(§1-2, §2-2). |
| **형태** | **규칙 문장이 먼저, 예시는 그 밑에서 규칙을 보여주는 역할. 짧은 대조쌍(Bad→Good)이나 작은 표가 표준** | Anthropic 공식 문서 자체가 Good/Bad 쌍을 일상적으로 쓴다(§1-2). OpenAI는 "예시가 보여주는 행동은 반드시 규칙에도 적어라"(§4-1). Claude Code 문서의 "구체적으로 써라" 권고도 X 대신 Y 형태다(§1-3). |
| **overfitting·복사** | **실재하는 위험. "다양하게", "규칙과 같은 방향으로", "일반 원리 + 이유"로 막는다** | Anthropic: 예시는 "Diverse"해야 의도치 않은 패턴을 안 배운다(§1-1). skill-creator: "super-narrow"한 예시나 "overfitty"한 수정 금지(§1-4). OpenAI: 예시 문구를 그대로 반복한다(§4-1). pstack: 실패한 세션 하나에서 나온 수정은 그 세션에 overfit한다(§3-3). |
| **낡음(staleness)** | **코드를 베낀 예시가 낡는다. 코드와 무관한 예시(어휘, 문체)는 거의 안 낡는다** | 낡는다고 경고하는 대상은 모두 *코드 사본*이다. Cursor: "canonical example을 가리켜라, 복사하지 마라"(§5-1). HumanLayer: 코드 조각 대신 `file:line`(§6-2). Matt: 환경을 옮겨 적은 문서는 *cache*다(§2-1). 반대로 날짜처럼 시간에 묶인 정보는 Anthropic도 금지한다(§1-2). |
| **context 비용** | **상시 로드 파일에서는 한 줄 한 줄이 매 턴 비용. "모든 branch가 필요로 하면 인라인, 일부만 필요하면 disclose"** | Matt의 branch 기준(§2-1), Claude Code의 CLAUDE.md 200줄 목표와 path-scoped rule(§1-3), Anthropic의 "context window는 공공재"(§1-2). |

### 추천

1. **예시는 기본값이 아니라 처방이다.** 규칙 문장만으로 Claude가 실제로 틀리는 것을 봤을 때(또는 판단이 명백히 갈리는 경계가 있을 때) 넣는다. Claude Code·Cursor 문서가 똑같이 "같은 실수가 반복되면 규칙을 추가하라"는 순서를 권한다(§1-3, §5-1).
2. **넣을 때는 규칙 → 이유 → 소수의 다양한 예시** 순서. 예시 하나하나가 서로 다른 경우(branch)를 대표하게 하고, 같은 범주를 반복하지 않는다.
3. **코드를 예시로 복사하지 않는다.** 코드 규칙이면 lint로 강제하거나(이 저장소의 `eslint.config.mjs`처럼) 실제 파일을 가리킨다. 어휘·문체처럼 코드와 무관한 규칙에서만 인라인 예시가 오래 산다.
4. **금지형 예시는 최소로, 그리고 반드시 긍정형과 짝을 짓는다**(§2-1 negation, §1-1 "what to do instead").
5. **검증은 실행으로.** 예시를 넣고 뺀 두 판을 실제로 돌려 본다(§1-2 evaluation-driven, §3-3 eval).

`language.md`에 대한 구체적인 권고는 맨 끝 절에 있다. 요지: **작은 표는 넣는다. 다만 3열 × 5개(15칸)가 아니라 "용어 한 줄에 세 가지 형태"를 보여주는 3–4행 표로 줄이고, 각 행을 서로 다른 범주로 고르며, 원칙 문장을 표 위에 둔다.**

---

## 1. Anthropic (1차 출처)

### 1-1. Prompting best practices — "Use examples effectively"

출처: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices (구 multishot-prompting 페이지 URL도 이 페이지로 이어진다)

- **"Use examples effectively"** 절: 예시는 출력의 format, tone, structure를 잡는 "most reliable ways" 중 하나라고 한다. 예시의 세 조건:
  - **Relevant**: 실제 사용 사례를 그대로 반영.
  - **Diverse**: edge case를 덮고, Claude가 "unintended patterns"를 줍지 않을 만큼 다양하게.
  - **Structured**: `<example>` 태그로 감싸 지침과 구분.
  - Tip: "Include 3–5 examples for best results." Claude에게 예시의 relevance·diversity를 평가시키라는 제안도 있다.
- **"Add context to improve performance"** 절: "NEVER use ellipses"보다 TTS 엔진이 읽는다는 *이유*를 붙인 판이 낫다. "Claude can generalize from the explanation." → 예시만 늘리기보다 이유를 주면 예시 밖으로 일반화된다.
- **"Control the format of responses"** 절: "Tell Claude what to do instead of what not to do". 그리고 프롬프트의 문체가 출력 문체에 영향을 준다("Match your prompt style to the output you want").
- **"Leverage thinking..." 부근**: "Multishot examples work with thinking." 예시가 thinking 안의 접근 방식까지 형성한다.
- **미확인**: 예전 Claude 4 판 가이드에 있던 것으로 알려진 "Claude 4 models pay close attention to details and examples" 류 문구(예시가 지침보다 강하게 복제된다는 경고)는 **현재 공식 페이지에서는 찾지 못했다.** 2차 출처(예: https://yiweishen.github.io/blog/posts/claude-4-prompt-engineering-best-practices )에서만 인용된다. 현재 판에서 같은 취지를 담당하는 것은 위의 "Diverse ... unintended patterns" 문장이다.

### 1-2. Skill authoring best practices

출처: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

이 문서는 **자기 자신이 예시를 아주 많이 쓴다.** 거의 모든 권고가 `**Good example**` / `**Bad example**` 쌍이나 짧은 코드 블록으로 붙어 있다. 규칙 1개당 대조쌍 1개 꼴이다.

- **"Concise is key"**: "The context window is a public good." 기본 가정은 "Claude is already very smart", 각 정보에 "Does this paragraph justify its token cost?"를 물어라. (예시도 이 질문을 통과해야 한다.)
- **"Set appropriate degrees of freedom"**: 길이 여럿이면 high freedom(문장 지침), 일관성이 중요하면 low freedom(정확한 스크립트). → 예시의 구체성도 과제의 취약성에 맞춘다.
- **"Examples pattern"** (Common patterns 아래): "For Skills where output quality depends on seeing examples, provide input/output pairs". 커밋 메시지 예시 3개를 보이고 끝에 규칙 문장("Follow this style: type(scope): ...")을 한 줄 더 붙인다. 결론 문장: 예시는 "desired style and level of detail"을 설명보다 분명히 전한다. → **예시 3개 + 규칙 문장**이 공식 모범형이다.
- **"Progressive disclosure patterns"**: 디렉토리 예시에 `examples.md`: "Usage examples (loaded as needed)". 본문에는 "**Examples**: See [EXAMPLES.md](EXAMPLES.md)". → 예시가 많으면 별도 파일로 뺀다.
- **"Avoid time-sensitive information"**: "before August 2025면 옛 API" 같은 내용은 Bad example. 낡을 정보는 "Old patterns" 절로 격리.
- **"Use consistent terminology"**: 한 개념에 용어 하나. (용어 규칙인 `language.md`와 결이 같다.)
- **"Build evaluations first"**: 스킬 없이 먼저 돌려 실패를 기록하고, "Write minimal instructions"로 그 실패만 막는다. 체크리스트에 "Examples are concrete, not abstract".

### 1-3. Claude Code memory 문서 (CLAUDE.md, `.claude/rules/`)

출처: https://code.claude.com/docs/en/memory

- **"CLAUDE.md vs auto memory"**: CLAUDE.md는 "context, not enforced configuration". 꼭 막아야 하면 hook을 쓴다. "The more specific and concise your instructions, the more consistently Claude follows them."
- **"When to add to CLAUDE.md"**: "Claude makes the same mistake a second time" 등. → 추가의 계기는 관찰된 실수.
- **"Write effective instructions"**: "concrete enough to verify". 대조 형태로 세 쌍을 든다. 예: "Use 2-space indentation" instead of "Format code properly". → 공식 문서가 권하는 "구체성"이 사실상 짧은 예시를 규칙에 박아 넣는 것이다.
  - **Size**: "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence." 일부에만 해당하는 것은 path-scoped rule로.
  - **Consistency**: 서로 모순되면 "Claude may pick one arbitrarily". 주기적으로 낡거나 충돌하는 지침을 지우고, `/doctor prompt-audit`로 감사.
- **"Organize rules with `.claude/rules/`"**: `paths` frontmatter가 없는 rule은 `.claude/CLAUDE.md`와 같은 우선순위로 매 세션 로드된다. → `language.md`는 `paths`를 둘 이유가 없으니(모든 응답에 적용) **상시 로드 비용을 그대로 낸다.**

### 1-4. anthropics/skills — skill-creator

출처: https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md (clone 시점 커밋 `ca45fc4`, 2026-10-28)

- L129 **"Examples pattern"**: "It's useful to include examples." Input/Output 형식 하나를 보인다.
- L139 **"Writing Style"**: 무거운 MUST보다 *why*를 설명하라. "make the skill general and not super-narrow to specific examples."
- L298 **"Generalize from the feedback"**: 몇 개 예시로 반복 개발하다 보면 그 예시에만 맞는 스킬이 된다. "fiddly overfitty changes"나 "oppressively constrictive MUSTs" 대신 다른 비유나 작업 방식을 시도하라. → **예시 overfitting을 명시적으로 경고하는 1차 출처.**
- L302 **"Explain the why"**: ALWAYS/NEVER 대문자는 "yellow flag".
- L394: description 최적화도 train/test를 60/40으로 나눠 test 점수로 고른다("to avoid overfitting").

### 1-5. Anthropic engineering blog — Effective context engineering for AI agents

출처: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents (Anthropic 공식 블로그. 제품 문서는 아니지만 1차 출처로 본다)

- **"The anatomy of effective context"**: 팀들이 흔히 "a laundry list of edge cases"를 프롬프트에 쑤셔 넣는데, 권하지 않는다. 대신 "diverse, canonical examples"를 큐레이션하라. LLM에게 예시는 "pictures" worth a thousand words.
- 같은 절, "right altitude": 너무 brittle한 하드코딩 로직과 구체적 신호가 없는 막연한 지침 사이의 Goldilocks zone.
- "minimal set of information that fully outlines your expected behavior". minimal이 곧 short는 아니다.
- **"Why context engineering is important..."**: context rot, "attention budget". context는 한계효용이 줄어드는 유한 자원.

---

## 2. mattpocock/skills (1차 출처)

출처: https://github.com/mattpocock/skills (clone 시점 커밋 `a496f55`, 2026-10-29, `plugin.json` version 1.3.2). 로컬 설치본(`~/.claude/plugins/synced/.../58da2c13-.../`, `plugin.json` version 1.2.3)의 `writing-for-agents`는 upstream과 `diff` 결과 동일했다.

### 2-1. `writing-for-agents` 스킬 — 예시에 대한 직접 지침은 없다

파일: `skills/productivity/writing-for-agents/SKILL.md` (82줄 정도), `SKILL-MECHANICS.md`

**"예시를 넣어라/넣지 마라"를 직접 다루는 절은 없다.** 대신 예시 여부를 판단하는 데 그대로 쓸 수 있는 기준들이 있다.

- **"The two loads"** (L20–27): *context load*(상시 로드되는 줄이 매 턴 내는 토큰·주의력 비용)와 *cognitive load*(사람이 어떤 문서가 있는지 기억하는 비용).
- **"Information hierarchy"** (L29–43): in-file step → in-file reference → disclosed reference. 판정 기준: "inline what every branch needs, and push behind a pointer what only some branches reach." *Sprawl*: 줄마다 살아 있어도 너무 길면 주의가 얇아진다.
- **"Leading words"** (L61–74): 한 단어가 사전학습된 개념을 끌어와 긴 설명을 대신한다. **Negation** (L74): 금지형은 금지된 행동을 context로 끌어들여 "더 쉽게 떠오르게" 한다("Don't think of an elephant"). 긍정형 목표를 말하고, 금지는 긍정형으로 못 쓰는 hard guardrail일 때만, 그것도 긍정형과 짝지어서.
- **"Pruning"** (L76–81):
  - 환경을 옮겨 적은 문서는 **cache**다. "Cache what the agent cannot find by looking: the unwritten convention, the reason behind a choice". 한 번에 찾을 수 있는 것은 환경에 맡겨라, 거기서는 낡지 않는다. → 코드 예시의 staleness에 대한 Matt의 답.
  - **Relevance**와 **sediment**: 추가는 안전해 보이고 삭제는 위험해 보여서 낡은 층이 쌓인다.
  - **No-op**: 모델이 이미 기본으로 하는 것을 지시하면 아무 말도 안 하면서 비용만 낸다. 판정은 "running the document"로, 즉 실행해서.

**이 스킬이 실제로 예시를 쓰는 방식**: 82줄 동안 예시는 인라인 몇 개뿐이다. leading word를 설명하는 두 개의 "→" 쌍(L69–70, `"fast, deterministic, low-overhead" → _tight_`), 괄호 속 단어 예(_lesson_, _fog of war_), elephant 비유 정도. 예시 전용 절이나 표는 없다. 원칙 대 예시 비율은 대략 **10:1 이상**.

### 2-2. 다른 스킬들의 실제 예시 사용

- `CLAUDE.md`/`AGENTS.md` (33줄, 두 파일 동일): **예시 0개.** 예를 들어 L25 em-dash 금지 규칙도 예시 없이 "대신 comma, colon, period, parentheses, conjunction"이라는 긍정형 대안과 "blind character substitution 금지"라는 이유만 준다. → 어휘·문체 규칙인데도 예시 없이 쓴 사례.
- `skills/engineering/tdd/SKILL.md` L16: "See [tests.md](tests.md) for examples". 본문(38줄)에는 예시를 두지 않고 `tests.md`(77줄)에 `// GOOD:` / `// BAD:` 코드 쌍을 모았다. → **예시는 disclosed reference로 뺀다.** CHANGELOG.md L315에는 tautological test 반례를 추가할 때 원칙·체크리스트·"BAD/GOOD example pair in `tests.md`"를 같이 넣었다고 적혀 있다(규칙과 예시를 짝으로 추가).
- `skills/engineering/to-spec/SKILL.md` L37–39: `<user-story-example>` 태그로 감싼 **딱 1개**의 형식 예시.
- `skills/engineering/triage/AGENT-BRIEF.md` L70 이하 `## Examples`: 207줄 중 상당 부분이 완전한 worked example(좋은 brief 여러 개). 산출물 형식이 핵심인 파일이라 예시 비중이 크다. 이것도 SKILL.md 본문이 아닌 별도 파일이다.
- `skills/engineering/improve-codebase-architecture/HTML-REPORT.md` L121: 좋은 문구 세 개를 보이고 "Don't write *"easier to maintain"*" 같은 나쁜 문구를 이유("glossary에 없는 용어")와 함께 한 줄로 든다. → 문장 안에 녹인 대조쌍.

**요약**: Matt는 always-loaded 파일(`CLAUDE.md`, description)에는 예시를 거의 넣지 않고, 예시가 필요한 산출물 형식은 SKILL.md 안 짧은 태그 예시 1개 또는 별도 파일로 뺀다.

---

## 3. cursor/plugins — pstack (1차 출처)

출처: https://github.com/cursor/plugins/tree/main/pstack (clone 시점 커밋 `1ba91fc`, 2026-10-28). 작성자 poteto(React core team, Cursor).

### 3-1. 스킬 작성 지침: "결정을 바꾸는 문장만"

파일: `pstack/skills/poteto-mode/playbooks/authoring-a-skill.md` L10

- "When in doubt, delete. Keep only prose that changes a decision." 이유는 생략하고 하라고만 쓰되, 이유 없이는 헷갈리는 규칙에만 설명. structural source(타입, README, config)를 가리키고 "Don't restate".
- 예시에 대한 직접 언급은 없다. 기준은 "결정을 바꾸는가"다. 예시도 이 시험을 통과해야 한다.

### 3-2. "구조로 못 박을 수 없으면 실패 사례 예시를 붙여라"

파일: `pstack/skills/principle-encode-lessons-in-structure/SKILL.md` L3, L9

- description: 같은 지시를 두 번 쓰게 되면 "lint, metadata flag, runtime check, or script instead of more text"로 바꿔라.
- L9: "If the lesson needs judgment and cannot be encoded, make the instruction more prominent and add an example of the failure mode."
- **이번 조사에서 예시를 언제 넣을지를 가장 직접적으로 말한 1차 문장이다.** 순서: (1) 구조(lint 등)로 강제할 수 있으면 그렇게 하고 글은 쓰지 않는다. (2) 판단이 필요해서 못 하면 지시를 더 눈에 띄게 하고 **실패 사례 예시**를 붙인다.

### 3-3. 실패 세션 하나로 고친 규칙은 그 세션에 overfit한다

파일: `pstack/docs/guide/09-make-it-yours.md` L88

- "A fix written from one bad session tends to overfit that session, and over many edits the skill drifts." 그래서 스킬 수정은 eval과 함께 요청하라고 한다.
- → "Claude가 '당김 요청'이라고 썼다"는 한 번의 사건에서 바로 그 단어를 예시로 박으면, 예시가 그 단어 하나에 맞춰질 위험이 있다는 경고로 읽을 수 있다.

### 3-4. 실제 사례: `unslop` (문체 규칙 스킬)

파일: `pstack/skills/unslop/SKILL.md` (62줄)

- `language.md`와 가장 비슷한 종류의 파일(어휘·문체 규칙)이다. 약 27개 규칙 **거의 전부에 짧은 인라인 예시가 붙어 있다.** 형태는 세 가지:
  - 금지 단어 목록: 규칙 7 "AI vocabulary."에 단어 16개 나열 후 "Replace with plain words."
  - "X becomes Y" 대조쌍: 규칙 23 "In order to" becomes "To", 규칙 29 수동태 → 능동태.
  - 패턴 이름 + 예시 문장 하나: 규칙 9 "Not just X, but Y."
- 규칙 대 예시 비율은 대략 **1:1–1:3**. 예시는 모두 한 줄 안에 들어간다. 별도 예시 절이나 표는 없다.
- 단, `disable-model-invocation: true`라 **상시 로드되지 않는다**(사람이 부를 때만 로드). 상시 로드 비용을 낼 필요가 없어서 예시를 넉넉히 쓸 수 있다.
- 반대 사례로 `skills/no-comments/SKILL.md`는 절차형이라 예시 없이 단계만 있다.

---

## 4. OpenAI (1차 출처)

### 4-1. GPT-4.1 Prompting Guide

출처: https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide (구 cookbook.openai.com URL에서 308 redirect)

- 지침 디버깅 workflow: "ensure that any important behavior demonstrated in your examples are also cited in your rules." → **예시만으로 규칙을 전하지 마라. 예시가 보여주는 것은 규칙 문장으로도 적어라.**
- **Common Failure Modes**: sample phrase를 주면 모델이 "use those quotes verbatim and start to sound repetitive"한다. 다양하게 쓰라고 지시하라. → 예시 복사의 1차 증언.
- GPT-4.1은 "more literally"하게 따르고 "implicit rules are no longer being as strongly inferred". 권장 프롬프트 구조에 `# Examples` 절이 있다.
- 지침이 충돌하면 프롬프트 끝쪽 것을 따르는 경향.

### 4-2. GPT-5 Prompting Guide

출처: https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide

- 모순되거나 막연한 지침은 GPT-5에 "more damaging". 모순을 조정하느라 reasoning token을 쓴다.
- Cursor 사례: "Be THOROUGH when gathering information."이 GPT-5에는 역효과(도구 과다 호출)라서 말투를 누그러뜨렸다. → 예전 모델용으로 세게 박은 지시가 새 모델에서 no-op을 넘어 해가 되는 사례(낡음의 또 다른 축: *모델 변화*에 따른 낡음).

### 4-3. AGENTS.md (agents.md, Codex 문서)

- https://agents.md/ : 형식 요구 없음, 그냥 Markdown. "living documentation". 길이나 예시에 대한 지침은 **없다.** 샘플 파일 자체에는 예시 블록 없이 명령과 규칙만 있다.
- Codex AGENTS.md 문서: https://learn.chatgpt.com/docs/agent-configuration/agents-md (developers.openai.com/codex/guides/agents-md 에서 redirect). `project_doc_max_bytes` 기본 32 KiB를 넘으면 잘린다. "Keep rules concise, explain the behavior to flag and any safe path or exception". 포맷·lint는 CI에 맡겨라. 예시 사용법에 대한 지침은 없다.

---

## 5. Cursor rules 문서 (1차 출처)

출처: https://cursor.com/docs/context/rules (docs.cursor.com에서 이전된 현재 위치)

### 5-1. Best practices

- "Keep rules under 500 lines", "focused, actionable, and scoped".
- **"Provide concrete examples or referenced files"** → 예시를 권한다.
- 동시에 "Reference files instead of copying their contents.", "Point to canonical examples instead of copying code." 이유: "This keeps rules short and prevents them from becoming stale as code changes." → **staleness 대책은 '복사 대신 가리키기'.**
- "Start simple. Add rules only when you notice Agent making the same mistake repeatedly."
- 피할 것: 스타일 가이드 통째 복사("Use a linter instead. Agent already knows common style conventions."), 모든 명령 문서화, 드문 edge case.

---

## 6. 실무자 글 (2차 출처)

### 6-1. HumanLayer — Writing a good CLAUDE.md

출처: https://www.humanlayer.dev/blog/writing-a-good-claude-md (실무자 블로그, 2차)

- frontier thinking 모델은 "~ 150-200 instructions"를 꽤 일관되게 따른다고 주장(근거 출처는 이 글 안의 인용. 독립 검증은 **미확인**).
- "< 300 lines is best, and shorter is even better."
- Claude가 CLAUDE.md 내용이 현재 작업과 무관하다고 판단하면 무시한다고 주장. → "universally applicable" 지침만 두라.
- 코드 조각은 "out-of-date quickly", 대신 `file:line` 참조.
- "Never send an LLM to do a linter's job".

### 6-2. 접근하지 못했거나 읽지 않은 것

- Simon Willison 등 다른 실무자 글: 이번 조사에서 읽지 않았다(**미확인**).
- Cursor 내장 `create-skill` 스킬(pstack이 위임하는 대상): 공개 원문을 찾지 못했다(**미확인**).

---

## 7. 종합: 실무자들이 trade-off를 다루는 방식

| 위험 | 대책 | 출처 |
|---|---|---|
| 상시 로드 context 비용 | 모든 branch가 쓰는 것만 인라인, 나머지는 별도 파일·path-scoped rule·user-invoked skill로 | Matt §2-1, Claude Code §1-3, Anthropic §1-2, pstack unslop §3-4 |
| 예시가 좁아서 overfit·복사 | 다양하게(서로 다른 경우를 대표), 규칙 문장과 이유를 같이, 한 사건에서 바로 예시를 만들지 말고 eval로 확인 | Anthropic §1-1·§1-4, OpenAI §4-1, pstack §3-3 |
| 예시가 낡음 | 코드 사본은 넣지 말고 가리키거나 lint로. 시간에 묶인 정보 금지. 주기적 감사(`/doctor prompt-audit`), 삭제 규율 | Cursor §5-1, HumanLayer §6-1, Matt §2-1, Anthropic §1-2·§1-3 |
| 금지형이 오히려 금지 행동을 부름 | 긍정형을 먼저, 금지는 꼭 필요할 때 짝지어서 | Matt §2-1, Anthropic §1-1 |
| 예시가 아무것도 안 바꿈(no-op) | 결정을 바꾸는지 실행해서 확인. 모델이 이미 하는 것엔 안 붙임 | Matt §2-1, pstack §3-1, Anthropic §1-2 |

---

## 이 저장소에의 적용: language.md에 예시를 넣을까

### 판정: 넣는다. 단 작게, 그리고 형태를 바꿔서.

**넣어야 하는 이유**

1. **구조로 강제할 수 없는 판단 규칙이다.** "자리잡은 음차인가, 원어로 둘 것인가"는 lint로 못 잡는다. pstack의 기준(§3-2)이 정확히 이 경우에 "실패 사례 예시를 붙여라"라고 한다.
2. **규칙 문장만으로는 경계가 흐리다.** "업계 용어는 원어로"라고만 쓰면 "커밋"은 원어(commit)로 써야 하는지 음차가 맞는지 갈린다. 이 경계를 보여주는 데는 예시가 설명보다 싸다(§1-1 "most reliable", §1-2 "more clearly than descriptions alone").
3. **낡을 위험이 거의 없다.** 예시가 코드가 아니라 어휘다. Cursor·HumanLayer·Matt가 경고하는 staleness는 모두 *코드 사본*에 대한 것이다(§5-1, §6-1, §2-1). "Pull Request"는 코드베이스가 바뀌어도 그대로다.
4. **모든 branch가 쓴다.** 이 rule은 모든 응답·문서에 적용되므로 Matt의 기준(§2-1)대로 disclose하지 말고 인라인으로 둔다. 비용은 표 몇 줄로 작다.

**제안된 형태(3열 × 각 5개)를 그대로 쓰지 않는 이유**

- **열이 범주별로 따로 놀면** "번역어 X" 열의 다섯 단어, "음차" 열의 다섯 단어, "원어" 열의 다섯 단어가 서로 다른 단어가 된다. 그러면 모델은 판단 기준이 아니라 **목록 15개**를 배운다. OpenAI가 경고한 "verbatim" 복사(§4-1)와 Anthropic의 "unintended patterns"(§1-1) 위험이 커지고, 목록에 없는 용어에서는 기준이 안 보인다.
- **"번역어 X" 열 다섯 칸은 금지 단어 다섯 개를 상시 context에 올린다.** Matt의 negation 경고(§2-1)에 정면으로 걸린다. 실패 사례는 하나면 충분하다(§3-2도 "an example", 단수).
- 15칸은 Anthropic이 권하는 3–5개(§1-1)를 크게 넘고, 매 턴 비용을 낸다.

### 권고 형태

순서는 **원칙(긍정형) → 판단 순서 → 작은 표**. 표는 **행이 용어 하나**이고, 그 용어를 세 형태로 보여준다. 행 수는 3–4개, 각 행은 서로 다른 범주(git/협업 용어, 이미 자리잡은 음차, AI·LLM 용어, 제품명)를 대표하게 고른다.

```markdown
## 용어

고유명사와 업계 용어는 원어로 쓴다. 한글 음차가 이미 자리잡은 말은 음차를 쓴다.
낯선 번역어를 새로 만들지 않는다. 확신이 없으면 원어로 둔다.

| 원어 | 쓰는 형태 | 쓰지 않는 형태 |
| - | - | - |
| Pull Request | Pull Request | 당김 요청 |
| commit, branch | 커밋, 브랜치 | 위탁, 가지 |
| context window | context window | 맥락 창 |
| Next.js, App Router | Next.js, App Router | (번역하지 않는다) |
```

(표 안의 "쓰지 않는 형태" 단어는 예시를 위한 것이다. 실제로 Claude가 틀린 단어가 있으면 그것으로 바꾼다. "위탁, 가지" 같은 단어는 이번 조사에서 실제로 관찰된 실수가 아니니, 관찰된 실수가 없으면 그 칸을 비워 두거나 "—"로 둬도 된다.)

이 형태의 근거:

- **규칙 문장이 먼저 있고 표는 그걸 보여준다**: OpenAI "examples ... also cited in your rules"(§4-1), Anthropic Examples pattern의 "예시 3개 + 규칙 한 줄"(§1-2).
- **행마다 다른 범주**: Anthropic "Diverse"(§1-1), "diverse, canonical examples"(§1-5). 같은 git 용어를 다섯 개 늘어놓지 않는다.
- **"확신이 없으면 원어"라는 기본값**이 표 밖의 용어를 처리한다. 표가 목록이 아니라 기준의 예시라는 점이 분명해진다(skill-creator "not super-narrow", §1-4).
- **긍정형 열이 앞, 금지 열은 뒤**: Matt의 negation(§2-1), Anthropic "what to do instead"(§1-1).
- **이유 한 줄을 붙여도 좋다**(선택): 예를 들어 "독자가 원문 문서·도구에서 그 단어로 검색하기 때문" 같은 이유. Anthropic은 이유가 있으면 일반화가 된다고 한다(§1-1 "Claude can generalize from the explanation"). 단 이유가 사실이어야 하니 사용자가 고른다.

### overfitting·낡음에 대한 장치

1. **행 추가는 관찰된 실수가 계기일 때만.** Claude Code 문서의 "same mistake a second time"(§1-3), Cursor의 "same mistake repeatedly"(§5-1). 한 번의 사건에서 바로 행을 늘리지 않는다(pstack §3-3).
2. **상한을 둔다.** 표는 5행을 넘기지 않는다. 넘으면 행 하나가 새 *범주*를 대표하는지 보고, 같은 범주면 합친다. 그래도 길어지면 그때 별도 파일로 disclose를 고민한다(Matt §2-1, Anthropic §1-2).
3. **검증은 실행으로.** 표가 있는 판과 없는 판으로 같은 요청(예: "이 브랜치 작업을 요약하고 PR 본문 써 줘")을 새 세션에서 돌려 보고, 표가 결정을 바꾸는지 본다. 안 바꾸면 no-op이니 지운다(Matt §2-1, Anthropic §1-2 evaluation-driven, pstack §3-3).
4. **모델이 바뀌면 다시 본다.** 예전 모델용으로 세게 박은 지시가 새 모델에서 해가 된 사례가 있다(OpenAI §4-2). `/doctor prompt-audit`로 주기적으로 감사한다(§1-3).

### 다른 Claude 파일에 예시를 넣을지에 대한 일반 기준

`language.md`만이 아니라 앞으로 쓸 rule·skill 전반에 같은 질문을 순서대로 적용하면 된다.

1. **lint·hook·스크립트로 강제할 수 있나?** 그렇다면 글로 쓰지 않는다(pstack §3-2, Cursor §5-1, HumanLayer §6-1). 이 저장소의 `project-structure.md`가 import 방향을 `pnpm lint`에 맡긴 것이 이 경우다.
2. **Claude가 이미 기본으로 하는가?** 그렇다면 규칙도 예시도 no-op이다(Matt §2-1, Anthropic §1-2).
3. **규칙 문장만으로 판단이 갈리는 경계가 있나?** 있으면 예시를 넣는다. 서로 다른 경우를 대표하는 소수(3–5개 안쪽), 규칙 문장 아래에(§1-1, §1-2, §3-2).
4. **예시가 코드인가?** 그렇다면 복사하지 말고 실제 파일을 가리킨다(Cursor §5-1, HumanLayer §6-1).
5. **상시 로드되는 파일인가, 그리고 모든 경우에 필요한가?** 일부 경우만 필요하면 별도 파일·path-scoped rule·skill로 뺀다(Matt §2-1, Claude Code §1-3).
