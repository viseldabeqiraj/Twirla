import { useTranslation } from '../../i18n/i18n';

export default function HowItWorksSection() {
  const { t } = useTranslation();
  const steps = [
    { key: 'landing.howItWorksPlay', emoji: '🎮' },
    { key: 'landing.howItWorksWin', emoji: '🎁' },
    { key: 'landing.howItWorksClaim', emoji: '✨' },
  ];
  return (
    <section className="shop-section shop-how-it-works" aria-labelledby="how-it-works-title">
      <div className="shop-section-inner">
        <h2 id="how-it-works-title" className="shop-section-title">
          {t('landing.howItWorksTitle')}
        </h2>
        <ul className="shop-how-steps">
          {steps.map((step) => (
            <li key={step.key} className="shop-how-step">
              <span className="shop-how-step-emoji" aria-hidden>{step.emoji}</span>
              <span className="shop-how-step-text">{t(step.key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
