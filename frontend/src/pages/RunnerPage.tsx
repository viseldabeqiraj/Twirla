import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n/i18n';
import RunnerGame from '../games/runner/RunnerGame';
import './RunnerPage.css';

export default function RunnerPage() {
  const { t } = useTranslation();
  return (
    <div className="runner-page">
      <Link to="/" className="runner-back-link">← {t('runner.back')}</Link>
      <RunnerGame />
    </div>
  );
}
