(function () {
  'use strict';
  const byId = (id) => document.getElementById(id);
  const form = byId('planner-form');
  const result = byId('result');
  let plan;

  const copy = {
    demand: {
      label: 'спрос',
      hypothesis: (thing) => `Если показать ${thing} людям с недавней похожей задачей, часть из них признает проблему достаточно важной, чтобы согласиться на следующий шаг.`,
      action: (thing, horizon) => `За ${horizon} составьте короткий оффер для «${thing}» и лично покажите его 10 людям, которые сталкивались с этой задачей в последние 30 дней. Не объясняйте продукт дольше 60 секунд; попросите описать свой последний похожий случай.`,
      data: 'Считайте только наблюдаемые ответы: число контактов, ответы, конкретные последние случаи и добровольные согласия на следующий шаг.',
      threshold: 'Сигнал: не менее 3 из 10 человек описали недавнюю проблему своими словами и согласились на конкретное следующее действие.',
      stop: 'Остановитесь, если разговоры уходят в вежливую абстракцию или люди не могут вспомнить последний случай: сначала смените сегмент или формулировку проблемы.',
      insight: 'Спрос подтверждает не интерес к идее, а наличие недавней и достаточно острой ситуации.',
      next: 'Следующий цикл: превратите самый частый «последний случай» в один конкретный сценарий оффера.'
    },
    activation: {
      label: 'активация',
      hypothesis: (thing) => `Если человек увидит первый безопасный результат ${thing}, он выполнит первый шаг без дополнительного сопровождения.`,
      action: (thing, horizon) => `За ${horizon} соберите один ручной сценарий первого результата для «${thing}» и проведите через него 5 подходящих людей. Наблюдайте, на каком точном шаге они останавливаются.`,
      data: 'Фиксируйте начавших, завершивших первый шаг, время до результата и дословные причины остановки.',
      threshold: 'Сигнал: минимум 3 из 5 участников доходят до первого результата без подсказки после стартовой инструкции.',
      stop: 'Остановитесь, если людям приходится сначала понимать терминологию или верить в слишком большой результат: уменьшите обещание первого шага.',
      insight: 'Активация проверяет путь к первой ценности, а не качество будущего полного продукта.',
      next: 'Следующий цикл: уберите один барьер из шага, на котором чаще всего останавливались.'
    },
    pricing: {
      label: 'цену',
      hypothesis: (thing) => `Если предложить ${thing} с ясным результатом и ценой, часть подходящих людей подтвердит готовность обсуждать оплату, а не только хвалить идею.`,
      action: (thing, horizon) => `За ${horizon} покажите 8 подходящим людям одностраничный оффер «${thing}» с конкретным результатом, сроком и ориентиром цены. Попросите выбрать: обсуждать условия, отказаться с причиной или назвать альтернативу.`,
      data: 'Запишите количество предъявленных офферов, конкретные вопросы о покупке, отказы с причиной и альтернативы, за которые уже платят.',
      threshold: 'Сигнал: хотя бы 2 из 8 человек переходят к обсуждению условий или оставляют конкретное обязательство на следующий шаг.',
      stop: 'Остановитесь, если разговор остаётся на уровне «интересно» без вопроса о сроках, условиях или альтернативе: не считайте это спросом.',
      insight: 'Цена проверяется обязательством или осмысленным отказом, а не положительной оценкой идеи.',
      next: 'Следующий цикл: уточните результат и сегмент по мотиву самого содержательного отказа.'
    }
  };

  function normalizeIdea(value) {
    return value.trim().replace(/\s+/g, ' ').slice(0, 180);
  }

  function horizonText(value) {
    return { '24': '24 часа', '72': '72 часа', '7d': '7 дней' }[value];
  }

  function makePlan(idea, focus, horizon) {
    const thing = normalizeIdea(idea);
    const item = copy[focus];
    const duration = horizonText(horizon);
    return {
      idea: thing,
      focus,
      horizon: duration,
      hypothesis: item.hypothesis(thing),
      action: item.action(thing, duration),
      data: item.data,
      insight: item.insight,
      threshold: item.threshold,
      stop: item.stop,
      next: item.next,
      checklist: [
        `Назовите сегмент: кто и когда последний раз сталкивался с задачей «${thing}».`,
        `Подготовьте одно действие на ${duration}, не добавляя разработку «на будущее».`,
        'Зафиксируйте число попыток и факты до того, как будете их объяснять.',
        'Назначьте момент, когда вы прочитаете данные и выберете: продолжить, изменить или остановить.'
      ]
    };
  }

  function showPlan(current) {
    byId('context-output').textContent = `Фокус: ${copy[current.focus].label} · горизонт: ${current.horizon} · контекст: «${current.idea}».`;
    ['hypothesis', 'action', 'data', 'insight', 'threshold', 'stop'].forEach((key) => byId(`${key}-output`).textContent = current[key]);
    const checklist = byId('checklist');
    checklist.replaceChildren();
    current.checklist.forEach((text, index) => {
      const label = document.createElement('label');
      label.className = 'check-item';
      label.innerHTML = `<input type="checkbox" data-step="${index}"><span>${text}</span>`;
      checklist.appendChild(label);
    });
    byId('verdict').hidden = true;
    byId('observation').value = '';
    result.classList.remove('hidden');
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const idea = byId('idea').value;
    const error = byId('form-error');
    if (normalizeIdea(idea).length < 12) {
      error.textContent = 'Добавьте хотя бы пару предложений или URL, чтобы появилась осмысленная карточка.';
      byId('idea').focus();
      return;
    }
    error.textContent = '';
    plan = makePlan(idea, form.elements.focus.value, form.elements.horizon.value);
    showPlan(plan);
  });

  byId('restart').addEventListener('click', () => {
    result.classList.add('hidden');
    byId('idea').focus();
  });

  byId('evaluate').addEventListener('click', () => {
    const complete = document.querySelectorAll('#checklist input:checked').length;
    const observation = byId('observation').value.trim();
    const verdict = byId('verdict');
    let title; let body;
    if (complete < 3 || observation.length < 18) {
      title = 'Данных пока недостаточно';
      body = 'Не превращайте намерение в вывод: закройте минимум три пункта списка и запишите наблюдаемый факт — кто, что сделал, сколько раз и что сказал.';
    } else if (/0\b|ноль|никто|нет ответ|не ответ|отказ/i.test(observation)) {
      title = 'Сигнал требует пересмотра';
      body = 'Факт не поддержал текущую формулировку. Это не провал: выберите один конкретный мотив отказа и измените сегмент, обещание или действие — но не все сразу.';
    } else {
      title = 'Есть сигнал, но не доказательство';
      body = 'Наблюдение достаточно, чтобы сделать следующий маленький цикл. Не обобщайте его на весь рынок и не ускоряйте разработку без повторения сигнала на похожих людях.';
    }
    byId('verdict-title').textContent = title;
    byId('verdict-body').textContent = body;
    byId('next-cycle').textContent = plan.next;
    verdict.hidden = false;
    verdict.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  byId('download').addEventListener('click', () => {
    if (!plan) return;
    const checked = [...document.querySelectorAll('#checklist input')].map((box, index) => `${box.checked ? '[x]' : '[ ]'} ${plan.checklist[index]}`);
    const text = `# HADI Sprint AI — карточка эксперимента\n\n> Прототип. План не является валидацией рынка; решение принимается по реальным данным.\n\n- Контекст: ${plan.idea}\n- Фокус: ${copy[plan.focus].label}\n- Горизонт: ${plan.horizon}\n\n## H — Гипотеза\n${plan.hypothesis}\n\n## A — Действие\n${plan.action}\n\n## D — Данные\n${plan.data}\n\n## I — Инсайт\n${plan.insight}\n\n## Порог решения\n${plan.threshold}\n\n## Стоп-условие\n${plan.stop}\n\n## Чек-лист\n${checked.join('\n')}\n\n## Наблюдение\n${byId('observation').value.trim() || 'Не записано'}\n\n## Следующий цикл\n${plan.next}\n`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'hadi-sprint-card.md';
    link.click();
    URL.revokeObjectURL(link.href);
  });

  window.HadiSprint = { makePlan };
})();
