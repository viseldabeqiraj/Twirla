import { useTranslation } from '../../i18n/i18n';
import type { PlayStatus } from '../../utils/playTracking';
import './AlreadyPlayedMessage.css';

interface AlreadyPlayedMessageProps {
  playStatus: PlayStatus;
}

export default function AlreadyPlayedMessage({ playStatus }: AlreadyPlayedMessageProps) {
  const { t } = useTranslation();
  const hoursText = playStatus.hoursRemaining === 1 ? t('wheel.hour') : t('wheel.hours');

  return (
    <div className="experience-already-played">
      <p className="experience-already-played-title">{t('wheel.alreadyPlayed')}</p>
      {playStatus.hoursRemaining != null && playStatus.hoursRemaining > 0 ? (
        <p className="experience-already-played-hint">
          {t('wheel.comeBackIn', {
            hours: String(playStatus.hoursRemaining),
            hoursText,
          })}
        </p>
      ) : (
        <p className="experience-already-played-hint">{t('wheel.thanksParticipating')}</p>
      )}
    </div>
  );
}
