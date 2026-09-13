import { Modal } from './Modal';
import { Button } from './Button';

export function ConfirmModal({
  open,
  title = 'تأكيد العملية',
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = false,
  onConfirm,
  onClose,
}) {
  return (
    <Modal open={open} title={title} onClose={onClose} layer="z-[70]">
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      <div className="mt-5 flex gap-2">
        <Button
          className="flex-1"
          variant={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
        <Button className="flex-1" variant="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
      </div>
    </Modal>
  );
}
