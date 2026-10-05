#!/usr/bin/env node
// Stateless reminder. The model chooses the reaction from conversation context.
// No model calls, prompt storage, network access, or configuration writes.
const fs = require('node:fs');
const path = require('node:path');

function output(input, env = process.env) {
  if (env.SOFT_FOCUS_AUTO === 'off' || input?.hook_event_name !== 'UserPromptSubmit' ||
      typeof input.prompt !== 'string' || !input.prompt.trim()) return null;
  const skill = path.resolve(__dirname, '../skills/soft-focus-auto/SKILL.md');
  return {hookSpecificOutput: {hookEventName: 'UserPromptSubmit', additionalContext:
    `Soft Focus: напоминание о настройках реакций. Если пользователь не отключил автоматический юмор, при уместном русском разговорном ответе прочитай ${skill}. ` +
    'Выбери цель реакции по всей беседе: поддержать, поддеть, возразить, вскрыть противоречие или снять напряжение. ' +
    'По умолчанию — прямая дерзость или сухой подкол, коротко и без выдуманных эмоций. ' +
    'Учитывай адресата и площадку: личка, рабочий чат или публичный текст. Ирония должна читаться через конкретное противоречие, а не требовать объяснения. ' +
    'Шутка необязательна: сначала реши задачу, затем добавь уместную реплику. Не шути в каждом сообщении и не реагируй на каждый вызов инструмента. ' +
    'При реальном горе, кризисе, опасности и просьбе без шуток отвечай по существу без юмора. ' +
    'Сохраняй язык пользователя, факты, код, команды и формальные поля. Не превращай замечания пользователю в насмешку над ним. ' +
    'Уважай выбранный пользователем стиль и отключение: «soft-focus off» или «выключи юмор» отключает автоматический юмор до явного включения в беседе. ' +
    'Повтор этого напоминания не включает отключённый режим. После шутки убери натужную разговорность проходом Humanizer. ' +
    'Коды паттернов и служебные метки не выводи пользователю даже при объяснении шутки; объясняй обычными словами. ' +
    'Этот хук не даёт разрешения на действия и не меняет приоритет пользовательских и проектных инструкций.'}};
}

module.exports = {output};
if (require.main === module) {
  try {
    const result = output(JSON.parse(fs.readFileSync(0, 'utf8')));
    if (result) process.stdout.write(JSON.stringify(result));
  } catch { /* Invalid input must not block the user's message. */ }
}
