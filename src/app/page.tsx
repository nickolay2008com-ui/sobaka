import { FunnelQuiz } from "@/components/FunnelQuiz";
import { TrackLink } from "@/components/TrackLink";
import { TrackPage } from "@/components/TrackPage";
import { BUSINESS, SITE } from "@/lib/content";

const capabilities = [
  ["01", "Продукт", "Сайт, приложение, бот, личный кабинет или другой рабочий цифровой контур."],
  ["02", "Клиентская система", "CRM, заявки, оплаты, статусы, напоминания, сопровождение и повторные продажи."],
  ["03", "Автоматизация", "Связи между сервисами, шаблоны, уведомления, аналитика и сокращение ручной рутины."],
  ["04", "Продвижение", "Промо-материалы, соцсети, рекламная инфраструктура, воронка и проверка гипотез."],
];

const principles = [
  ["Не продаю часы", "Я вхожу в проект ради работающей системы и долгого результата, а не ради бесконечного списка мелких задач."],
  ["Не присваиваю вашу роль", "Экспертность, содержательная работа и ответственность перед клиентом остаются у партнёра."],
  ["Не строю на обещаниях", "Сначала документ с моделью, затем первая рабочая версия, и только после неё первый платёж."],
];

export default function HomePage() {
  return (
    <>
      <TrackPage />
      <section className="hero-section">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span className="eyebrow">Дипломированный психолог · инженер компьютерных систем</span>
              <span className="live-dot">1–3 партнёрства одновременно</span>
            </div>
            <h1>Вы создаёте ценность для людей. <span>Я превращаю её в работающий проект.</span></h1>
            <p className="hero-lead">Вхожу техническим партнёром в сильные экспертные проекты: беру на себя продукт, приложение, CRM, автоматизацию, аналитику, промо, соцсети и рекламную систему. Удалённо, прозрачно и с долей в результате.</p>
            <div className="hero-actions">
              <TrackLink className="button button-primary" href="#qualification" eventName="hero_quiz_click">Проверить совместимость за 2 минуты <span>→</span></TrackLink>
              <a className="button button-secondary" href={SITE.allyUrl} target="_blank" rel="noreferrer">Посмотреть мой проект Ally AI ↗</a>
            </div>
            <div className="hero-proofline">
              <div><b>{new Intl.NumberFormat("ru-RU").format(BUSINESS.launchContribution)} ₽</b><span>вклад партнёра в запуск</span></div>
              <div><b>{BUSINESS.revenueSharePercent}%</b><span>моя доля в совместной деятельности</span></div>
              <div><b>{new Intl.NumberFormat("ru-RU").format(BUSINESS.firstPayment)} ₽</b><span>первый платёж после первой версии</span></div>
            </div>
          </div>

          <div className="hero-visual" aria-label="Схема партнёрства">
            <div className="system-card system-card-main">
              <span className="system-kicker">Совместный проект</span>
              <h2>Экспертиза × цифровая система</h2>
              <div className="system-flow">
                <div><span>Партнёр</span><b>метод · клиенты · содержание</b></div>
                <i>+</i>
                <div><span>Николай</span><b>продукт · автоматизация · рост</b></div>
              </div>
              <div className="system-output"><span>Результат</span><b>не набор услуг, а единая машина проекта</b></div>
            </div>
            <div className="floating-card floating-one"><span>CRM</span><b>вся работа с клиентами видна</b></div>
            <div className="floating-card floating-two"><span>Automation</span><b>меньше ручной суеты</b></div>
            <div className="floating-card floating-three"><span>Growth</span><b>гипотезы измеряются цифрами</b></div>
          </div>
        </div>
      </section>

      <section className="section section-tight">
        <div className="shell">
          <div className="section-heading split-heading">
            <div><span className="eyebrow">Что именно я беру на себя</span><h2>Техническая часть целиком, а не по кусочкам</h2></div>
            <p>Обычно эксперт нанимает разработчика, дизайнера, настройщика CRM, таргетолога и ещё кого-то, кто потом объясняет, почему виноваты остальные. Здесь одна архитектура и одна ответственность.</p>
          </div>
          <div className="capability-grid">
            {capabilities.map(([number, title, text]) => (
              <article className="capability-card" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="qualification">
        <div className="shell qualification-grid">
          <div className="qualification-copy">
            <span className="eyebrow">Отсев до разговора</span>
            <h2>Партнёрство подходит не каждому проекту. И это полезная новость.</h2>
            <p>Мне важнее несколько устойчивых проектов, чем коллекция временных энтузиазмов. Поэтому воронка честно проверяет четыре вещи: реальную экспертность, готовность работать с клиентами, ресурс на запуск и долгий горизонт.</p>
            <div className="mini-trust-list">
              <div><span>✓</span><p><b>Без оплаты за знакомство</b><small>Сначала проверяем, имеет ли смысл работать вместе.</small></p></div>
              <div><span>✓</span><p><b>Без захвата проекта</b><small>Роли, доступы и права фиксируются до разработки.</small></p></div>
              <div><span>✓</span><p><b>Без красивой неопределённости</b><small>Границы моей ответственности указаны прямо.</small></p></div>
            </div>
          </div>
          <FunnelQuiz />
        </div>
      </section>

      <section className="section philosophy-section">
        <div className="shell">
          <div className="section-heading centered-heading"><span className="eyebrow">Почему этому можно доверять</span><h2>Мастерство здесь ощущается не обещаниями, а устройством работы</h2></div>
          <div className="principle-grid">
            {principles.map(([title, text], index) => (
              <article key={title} className="principle-card"><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
          <div className="statement-card">
            <div><span className="eyebrow">Личная позиция</span><h2>Я не ищу «любой проект». Я ищу человека, с которым можно годами строить сильную систему.</h2></div>
            <p>Для меня надёжность важнее суеты. Договорённости фиксируются письменно, изменения видны, доступы распределены, цифры открыты. Если один из партнёров решит выйти, заранее определён переходный период и порядок передачи. Проект не должен быть заложником, но его рост закономерно зависит от обеих ключевых ролей.</p>
          </div>
        </div>
      </section>
    </>
  );
}
