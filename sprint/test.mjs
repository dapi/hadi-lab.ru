import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
const js = await readFile(new URL('./app.js', import.meta.url), 'utf8');
for (const marker of ['HADI Sprint AI', 'Прототип', 'Гипотеза', 'Стоп-условие', 'Скачать отчёт .md', 'noindex']) {
  assert.ok(html.includes(marker), `missing UX marker: ${marker}`);
}
const context = {
  window: {},
  document: { getElementById: () => ({ addEventListener() {} }) }
};
vm.createContext(context);
vm.runInContext(js, context);
const demand = context.window.HadiSprint.makePlan('сервис для кофеен', 'demand', '24');
const pricing = context.window.HadiSprint.makePlan('сервис для кофеен', 'pricing', '7d');
assert.notEqual(demand.hypothesis, pricing.hypothesis, 'focus must change plan');
assert.ok(demand.action.includes('24 часа'), 'horizon must affect plan');
assert.ok(pricing.action.includes('7 дней'), 'horizon must affect plan');
assert.ok(demand.hypothesis.includes('сервис для кофеен'), 'input must affect plan');
console.log('HADI Sprint AI source checks passed');
