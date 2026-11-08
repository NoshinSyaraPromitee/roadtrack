import { CircleCheck } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { SpeakButton } from '@/shared/voice';
import { Button, Card, Pictogram } from '@/shared/ui';

export function ComplaintSent({ onAgain }: { onAgain: () => void }) {
  const { t } = useI18n();
  return (
    <Card className="flex flex-col items-center py-8 text-center">
      <Pictogram icon={CircleCheck} size={88} />
      <h2 className="mt-4 font-sign text-3xl">{t('Complaint sent', 'অভিযোগ পাঠানো হয়েছে')}</h2>
      <div className="mt-3">
        <SpeakButton text={{ en: 'Complaint sent.', bn: 'অভিযোগ পাঠানো হয়েছে।' }} />
      </div>
      <Button size="lg" variant="secondary" className="mt-6" onClick={onAgain}>
        {t('Make another complaint', 'আরেকটি অভিযোগ করুন')}
      </Button>
    </Card>
  );
}
