import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/appStore';

export function PwaInstallCard() {
  const installPrompt = useAppStore((s) => s.installPrompt);
  const setInstallPrompt = useAppStore((s) => s.setInstallPrompt);
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true,
  );

  useEffect(() => {
    function onInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
    }
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, [setInstallPrompt]);

  async function install() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  const canInstall = !installed && !!installPrompt;

  return (
    <section className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <Smartphone size={16} className="text-blue-600" />
        <h3 className="text-sm font-extrabold">تنزيل التطبيق</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canInstall ? (
          <Button className="!px-3 !py-2 text-xs" onClick={install}>تنزيل الآن</Button>
        ) : null}

        {!canInstall && !installed ? (
          <p className="text-xs text-amber-800">
            Android: Chrome • iPhone: Safari
          </p>
        ) : null}

        {installed ? (
          <p className="text-xs text-emerald-800">تم التثبيت</p>
        ) : null}
      </div>

      <p className="mt-2 text-[11px] leading-5 text-slate-500">
        Android: افتح الموقع في Chrome، ثم اضغط على ثلاث نقاط ثم اختر «تثبيت التطبيق». <br />
        iPhone: افتح الموقع في Safari، ثم اضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية».
      </p>
    </section>
  );
}
