import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { PAYMENT_METHODS } from '../../db/payments';
import { todayISO } from '../../utils/dates';

export function PaymentModal({ open, target, onClose, onSave, title }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!target) {
      setForm(null);
      return;
    }
    const payment = target.payment;
    setForm({
      ...payment,
      amountDue: payment.amountDue || target.student.monthlyFee || 0,
      amountPaid: payment.amountPaid || 0,
      paymentDate: payment.paymentDate || todayISO(),
      paymentMethod: payment.paymentMethod || 'cash',
    });
  }, [target]);

  if (!form || !target) return null;

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyStatus(status) {
    const due = Number(form.amountDue) || 0;
    if (status === 'paid') setForm((prev) => ({ ...prev, status, amountPaid: due, paymentDate: prev.paymentDate || todayISO() }));
    else if (status === 'unpaid') setForm((prev) => ({ ...prev, status, amountPaid: 0 }));
    else setForm((prev) => ({ ...prev, status }));
  }

  function handleSave() {
    const due = Number(form.amountDue) || 0;
    const paid = Number(form.amountPaid) || 0;
    let status = form.status;
    if (paid <= 0) status = 'unpaid';
    else if (paid < due) status = 'partial';
    else status = 'paid';
    onSave({
      ...form,
      amountDue: due,
      amountPaid: paid,
      status,
      studentId: target.student.id,
    });
  }

  return (
    <Modal open={open} title={`${title || 'دفعة'} ${target.student.fullName}`} onClose={onClose}>
      <div className="mb-4 grid grid-cols-3 gap-2">
        <Button variant={form.status === 'paid' ? 'success' : 'secondary'} onClick={() => applyStatus('paid')}>تم الدفع</Button>
        <Button variant={form.status === 'partial' ? 'primary' : 'secondary'} onClick={() => applyStatus('partial')}>جزئي</Button>
        <Button variant={form.status === 'unpaid' ? 'danger' : 'secondary'} onClick={() => applyStatus('unpaid')}>لم يدفع</Button>
      </div>
      <div className="grid gap-3">
        <Input label="المبلغ المطلوب (₪)" type="number" value={form.amountDue} onChange={(e) => set('amountDue', e.target.value)} />
        <Input label="المبلغ المدفوع (₪)" type="number" value={form.amountPaid} onChange={(e) => set('amountPaid', e.target.value)} />
        <Select label="طريقة الدفع" value={form.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </Select>
        {form.paymentMethod === 'other' ? (
          <Input label="تفاصيل الطريقة" value={form.paymentMethodNote || ''} onChange={(e) => set('paymentMethodNote', e.target.value)} />
        ) : null}
        <Input label="تاريخ الدفع" type="date" value={form.paymentDate || ''} onChange={(e) => set('paymentDate', e.target.value)} />
        <Textarea label="ملاحظة على الدفعة" value={form.note || ''} onChange={(e) => set('note', e.target.value)} />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleSave}>حفظ الدفعة</Button>
          <Button
            variant="secondary"
            onClick={() => {
              const due = Number(form.amountDue) || 0;
              const paid = Number(form.amountPaid) || 0;
              const receipt = window.open('', '_blank', 'width=480,height=640');
              if (!receipt) return;
              receipt.document.write(`
                <html lang="ar" dir="rtl"><head><title>إيصال دفع</title>
                <style>
                  body{font-family:Tahoma,Arial;padding:24px;text-align:center}
                  .box{border:1px dashed #64748b;padding:20px}
                </style></head>
                <body>
                  <div class="box">
                    <h2>إيصال دفع</h2>
                    <p>${target.student.fullName}</p>
                    <p>المبلغ: ${paid} ₪ من ${due} ₪</p>
                    <p>التاريخ: ${form.paymentDate || ''}</p>
                    <p>${form.note || ''}</p>
                  </div>
                  <script>window.onload=()=>window.print()<\\/script>
                </body></html>`);
              receipt.document.close();
            }}
          >
            طباعة إيصال
          </Button>
        </div>
      </div>
    </Modal>
  );
}
