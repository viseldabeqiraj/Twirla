import { useTranslation } from '../../i18n/i18n';
import type { TestimonialConfig } from '../../types/ShopLandingConfig';

interface TestimonialsSectionProps {
  testimonials: TestimonialConfig[];
}

export default function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const { t } = useTranslation();
  if (!testimonials?.length) return null;
  return (
    <section className="shop-section shop-testimonials" aria-labelledby="testimonials-title">
      <div className="shop-section-inner">
        <h2 id="testimonials-title" className="shop-section-title">
          {t('landing.testimonialsTitle')}
        </h2>
        <ul className="shop-testimonials-list">
          {testimonials.map((item, i) => (
            <li key={i} className="shop-testimonial-card">
              <blockquote className="shop-testimonial-quote">"{item.quote}"</blockquote>
              <footer className="shop-testimonial-author">
                <strong>{item.author}</strong>
                {item.role && <span className="shop-testimonial-role">{item.role}</span>}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
