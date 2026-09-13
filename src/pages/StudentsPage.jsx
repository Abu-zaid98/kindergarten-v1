import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useStudentPayments } from '../hooks/usePayments';
import { useSettings } from '../hooks/useAuth';
import { saveStudent, deleteStudent } from '../db/students';
import { StudentList } from '../components/students/StudentList';
import { StudentForm } from '../components/students/StudentForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { formatILS } from '../utils/currency';
import { formatDate, monthName } from '../utils/dates';
import { methodLabel, STATUS_LABELS } from '../db/payments';
import { exportStudentLedger } from '../utils/exportExcel';

export function StudentsPage() {
  const { students } = useStudents();
  const settings = useSettings();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [opened, setOpened] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function openNew() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(student) {
    setEditing(student);
    setFormOpen(true);
  }

  async function handleSave(data) {
    await saveStudent(data);
    setFormOpen(false);
  }

  async function handleDelete(student) {
    if (!student) return;
    await deleteStudent(student.id);
    setOpened(null);
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold">الطلاب</h2>
          <p className="text-sm text-slate-500">{students.length} طالب</p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} />
          إضافة طالب
        </Button>
      </div>
      <StudentList
        students={students}
        query={query}
        onQuery={setQuery}
        onOpen={setOpened}
        onEdit={openEdit}
      />

      <Modal open={formOpen} title={editing ? 'تعديل طالب' : 'طالب جديد'} onClose={() => setFormOpen(false)} wide>
        <StudentForm
          student={editing}
          defaults={settings || {}}
          onSubmit={handleSave}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <StudentDetails
        student={opened}
        kindergartenName={settings?.kindergartenName}
        onClose={() => setOpened(null)}
        onEdit={() => { setOpened(null); openEdit(opened); }}
        onDelete={(student) => setDeleteTarget(student)}
      />

      <ConfirmModal
        open={!!deleteTarget}
        title="حذف طالب"
        message={`هل أنت متأكد من حذف الطالب ${deleteTarget?.fullName}؟ سيتم حذف جميع دفعاته أيضاً.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={() => handleDelete(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function StudentDetails({ student, onClose, onEdit, onDelete, kindergartenName }) {
  const history = useStudentPayments(student?.id);
  if (!student) return null;

  return (
    <Modal open={!!student} title="بطاقة الطالب" onClose={onClose} wide>
      <div className="grid gap-2 text-sm">
        <p><b>ولي الأمر:</b> {student.guardianName} ({student.guardianRelation})</p>
        <p><b>الجوال:</b> {student.phone1} {student.phone2 ? ` / ${student.phone2}` : ''}</p>
        <p><b>الرسوم:</b> {formatILS(student.monthlyFee)}</p>
        <p><b>التسجيل:</b> {formatDate(student.enrollmentDate)}</p>
        {student.notes ? <p><b>ملاحظات:</b> {student.notes}</p> : null}
      </div>
      <h3 className="mt-5 mb-2 font-extrabold">سجل المدفوعات</h3>
      <div className="max-h-64 overflow-auto rounded-2xl border border-slate-100">
        {history.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">لا توجد دفعات بعد.</p>
        ) : (
          history.map((p) => {
            const remaining = Math.max((Number(p.amountDue) || 0) - (Number(p.amountPaid) || 0), 0);
            return (
              <div key={p.id} className="flex justify-between border-b border-slate-100 p-3 text-sm">
                <span>{monthName(p.month)} {p.year}</span>
                <span>
                  {STATUS_LABELS[p.status]} · {formatILS(p.amountPaid)}
                  {p.status === 'partial' ? ` · المتبقي ${formatILS(remaining)}` : ''}
                  · {methodLabel(p.paymentMethod, p.paymentMethodNote)}
                </span>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onEdit}>تعديل</Button>
        <Button
          variant="secondary"
          onClick={() =>
            exportStudentLedger({
              kindergartenName,
              studentName: student.fullName,
              rows: history.map((p) => [
                monthName(p.month),
                p.year,
                p.amountDue,
                p.amountPaid,
                STATUS_LABELS[p.status],
                methodLabel(p.paymentMethod, p.paymentMethodNote),
                p.paymentDate,
                p.note || '',
              ]),
            })
          }
        >
          تصدير السجل
        </Button>
        <Button variant="danger" onClick={() => onDelete(student)}>
          <Trash2 size={16} />
          حذف
        </Button>
      </div>
    </Modal>
  );
}
