import { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import type { FAQItemConfig } from '../../types/ShopLandingConfig';

interface FAQSectionProps {
  faq: FAQItemConfig[];
}

export default function FAQSection({ faq }: FAQSectionProps) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!faq?.length) return null;
  return (
    <section className="shop-section shop-faq" aria-labelledby="faq-title">
      <div className="shop-section-inner">
        <h2 id="faq-title" className="shop-section-title">
          {t('landing.faqTitle')}
        </h2>
        <dl className="shop-faq-list">
          {faq.map((item, i) => (
            <div key={i} className="shop-faq-item">
              <dt>
                <button
                  type="button"
                  className="shop-faq-question"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  {item.question}
                </button>
              </dt>
              <dd
                id={`faq-answer-${i}`}
                aria-labelledby={`faq-question-${i}`}
                className={`shop-faq-answer ${openIndex === i ? 'shop-faq-answer-open' : ''}`}
              >
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
