import type { Metadata } from "next";
import { PartnershipCalculator } from "@/components/PartnershipCalculator";
import { ScopeMatrix } from "@/components/ScopeMatrix";
import { TrackLink } from "@/components/TrackLink";
import { TrackPage } from "@/components/TrackPage";

export const metadata: Metadata = {
  title: "Модель партнёрства",
  description: "Роли, этапы, деньги, документы, защита активов и порядок выхода из совместного проекта.",
};

const protocol = [
  ["01", "Диагностика", "Изучаю заявку, аудиторию, продуктовую идею и ограничения. Никаких универсальных пакетов, потому что проекты, к сожалению, ещё не научились быть одинаковыми."],
  ["02", "Карта договорённостей", "Фиксируем роли, результат первой версии, этапы, бюджет, долю, расходы, доступы, права и порядок выхода. Документ отправляется обеим сторонам по email."],
  ["03", "Первая рабочая версия", "Я собираю минимальный, но полноценный контур: его можно открыть, пройти и проверить на реальном сценарии."],
  ["04", "Первый платёж 20%", "После демонстрации и принятия первой версии партнёр вносит 20 000 ₽. Остальные 80 000 ₽ распределяются по этапам конкретного проекта."],
  ["05", "Запуск и развитие", "Подключаем CRM, автоматизацию, контент, рекламу и аналитику. Решения принимаются по данным, а не по громкости последнего мнения."],
];

const safeguards = [
  ["Активы и доступы", "Домены, рекламные кабинеты, CRM, репозиторий и платёжные сервисы заносятся в реестр. У каждой стороны есть понятный уровень доступа и резервный способ восстановления."],
  ["Расходы", "Любые внешние подписки, реклама и подрядчики согласуются заранее. Они не растворяются внутри загадочного слова «разработка»."],
  ["Отчётность", "В админке видны посещения, источники, этапы воронки, заявки и конверсия. Финансовая база расчёта доли определяется договором и сверяется регулярно."],
  ["Изменения", "Новые функции проходят через короткую запись: зачем нужны, как измеряем эффект, сколько занимают и что откладываем взамен."],
  ["Выход", "Заранее задаются уведомление, переходный период, передача документации, права на код и контент, расчёты и возможность выкупа доли."],
];

export default function PartnershipPage() {
  return (
    <>
      <TrackPage name="partnership_view" />
      <section className="inner-hero">
        <div className="shell narrow-shell">
          <span className="eyebrow">Шаг 2 из 3 · модель работы</span>
          <h1>Не подрядчик на задачи. <span>Технический партнёр с чёткой зоной ответственности.</span></h1>
          <p>Главный источник конфликтов в партнёрстве не деньги, а туман. Поэтому ниже нет «обсудим потом»: роли, вклад, доля, первый платёж, контроль и выход описаны до заявки.</p>
          <div className="anchor-row"><a href="#roles">Роли</a><a href="#economics">Экономика</a><a href="#protocol">Этапы</a><a href="#safeguards">Защита</a></div>
        </div>
      </section>

      <section className="section" id="roles">
        <div className="shell">
          <div className="section-heading split-heading"><div><span className="eyebrow">Распределение ответственности</span><h2>Две сильные роли вместо одного человека, который якобы умеет всё</h2></div><p>Я не веду вашу практику, не консультирую ваших клиентов, не заменяю бухгалтера и не исполняю офлайн-операции. Я отвечаю за цифровую систему и её развитие.</p></div>
          <ScopeMatrix />
        </div>
      </section>

      <section className="section dark-section" id="economics">
        <div className="shell">
          <div className="section-heading split-heading"><div><span className="eyebrow">Деньги без фокусов</span><h2>100 000 ₽ в запуск + 20% технической стороне</h2></div><p>Вклад оплачивает создание полноценного рабочего контура. Доля связывает мой интерес не с количеством часов, а с тем, чтобы система продавала, обслуживала и развивалась.</p></div>
          <PartnershipCalculator />
        </div>
      </section>

      <section className="section" id="protocol">
        <div className="shell">
          <div className="section-heading centered-heading"><span className="eyebrow">Протокол начала</span><h2>Сначала ясность и результат. Потом деньги и масштабирование.</h2></div>
          <div className="timeline">
            {protocol.map(([number, title, text]) => (
              <article className="timeline-item" key={number}><span className="timeline-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section safeguards-section" id="safeguards">
        <div className="shell safeguards-grid">
          <div className="sticky-copy"><span className="eyebrow">Рабочее доверие</span><h2>Доверять проще, когда система не требует верить на слово</h2><p>Хорошие отношения не отменяют правила. Наоборот, правила берегут отношения от памяти, эмоций и внезапно творческой бухгалтерии.</p></div>
          <div className="safeguard-list">
            {safeguards.map(([title, text], index) => (
              <details key={title} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span><b>{title}</b><i>+</i></summary><p>{text}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="section fit-section">
        <div className="shell fit-grid">
          <div className="fit-column fit-positive"><span className="eyebrow">Подходит</span><h3>Партнёрство имеет смысл, если вы:</h3><ul><li>уже умеете помогать людям или бизнесу;</li><li>готовы лично отвечать за содержание и клиентов;</li><li>понимаете ценность инвестиций в запуск;</li><li>хотите строить актив, а не разовую кампанию;</li><li>готовы к прозрачным цифрам и договорённостям.</li></ul></div>
          <div className="fit-column fit-negative"><span className="eyebrow">Не подходит</span><h3>Лучше не начинать, если вы:</h3><ul><li>ищете исполнителя «сделать всё за процент»;</li><li>не хотите работать с клиентами;</li><li>ожидаете гарантированной прибыли;</li><li>меняете направление каждую неделю;</li><li>хотите скрывать цифры или обходить закон.</li></ul></div>
        </div>
      </section>

      <section className="section final-cta-section">
        <div className="shell final-cta-card">
          <div><span className="eyebrow">Шаг 3 из 3</span><h2>Теперь можно проверить конкретно ваш проект</h2><p>Многошаговая заявка сама покажет предварительную совместимость. Отправка ни к чему не обязывает и не запускает оплату.</p></div>
          <TrackLink className="button button-primary" href="/apply" eventName="partnership_apply_click">Проверить проект <span>→</span></TrackLink>
        </div>
      </section>
    </>
  );
}
