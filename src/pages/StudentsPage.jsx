import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Plus, Trash2 } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useEnrollmentPayment, useStudentPayments } from '../hooks/usePayments';
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
import { useClassrooms } from '../hooks/useClassrooms';
import { usePaymentMatrix } from '../hooks/usePayments';
import { useAppStore } from '../store/appStore';
import { emptyEnrollmentPayment, saveEnrollmentPayment } from '../db/enrollmentPayments';
import { PaymentModal } from '../components/payments/PaymentModal';

export function StudentsPage() {
  const { students } = useStudents();
  const settings = useSettings();
  const { classrooms } = useClassrooms();
  const selectedYear = useAppStore((s) => s.selectedYear);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [opened, setOpened] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [enrollmentTarget, setEnrollmentTarget] = useState(null);
  const [view, setView] = useState('cards');
  const classroomId = searchParams.get('classroom') || '';
  const workingMonths = Array.isArray(settings?.workingMonths) && settings.workingMonths.length ? settings.workingMonths.map(Number).sort((a, b) => a - b) : Array.from({ length: 12 }, (_, index) => index + 1);
  const payments = usePaymentMatrix(selectedYear, workingMonths);

  function setClassroomId(id) { setSearchParams(id ? { classroom: id } : {}); }

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
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">الطلاب</h2>
          <p className="text-sm text-slate-500">{classroomId ? `${students.filter((s) => s.classroomId === classroomId).length} طالب في الفصل المحدد` : `${students.length} طالب`}</p>
        </div>
        <div className="flex items-center gap-2"><div className="flex rounded-xl border border-slate-200 bg-white p-1"><button type="button" onClick={() => setView('cards')} className={`rounded-lg p-2 ${view === 'cards' ? 'bg-blue-50 text-blue-700' : 'text-slate-400'}`} title="عرض البطاقات"><LayoutGrid size={17} /></button><button type="button" onClick={() => setView('table')} className={`rounded-lg p-2 ${view === 'table' ? 'bg-blue-50 text-blue-700' : 'text-slate-400'}`} title="عرض الجدول"><List size={17} /></button></div><Button onClick={openNew}><Plus size={16} /><span className="hidden sm:inline">إضافة طالب</span></Button></div>
      </div>
      <StudentList
        students={students}
        classrooms={classrooms}
        classroomId={classroomId}
        onClassroomChange={setClassroomId}
        query={query}
        onQuery={setQuery}
        onOpen={setOpened}
        onEdit={openEdit}
        view={view}
        payments={payments}
        months={workingMonths}
        year={selectedYear}
      />

      <Modal open={formOpen} title={editing ? 'تعديل طالب' : 'طالب جديد'} onClose={() => setFormOpen(false)} wide>
        <StudentForm
          student={editing}
          defaults={settings || {}}
          classrooms={classrooms}
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
        onEnrollment={(student, payment) => setEnrollmentTarget({ student, payment })}
      />

      <PaymentModal open={!!enrollmentTarget} target={enrollmentTarget} title="رسوم تسجيل" onClose={() => setEnrollmentTarget(null)} onSave={async (payment) => { await saveEnrollmentPayment(payment); setEnrollmentTarget(null); }} />

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

function StudentDetails({ student, onClose, onEdit, onDelete, onEnrollment, kindergartenName }) {
  const history = useStudentPayments(student?.id);
  const enrollmentPayment = useEnrollmentPayment(student?.id);
  if (!student) return null;

  return (
    <Modal open={!!student} title="بطاقة الطالب" onClose={onClose} wide>
      <div className="grid gap-2 text-sm">
        <p><b>ولي الأمر:</b> {student.guardianName} ({student.guardianRelation})</p>
        <p><b>الجوال:</b> {student.phone1} {student.phone2 ? ` / ${student.phone2}` : ''}</p>
        {student.classroom ? <p><b>الفصل:</b> {student.classroom}</p> : null}
        <p><b>الرسوم:</b> {formatILS(student.monthlyFee)}</p>
        <p><b>رسوم التسجيل:</b> {formatILS(student.enrollmentFee)}</p>
        <p><b>التسجيل:</b> {formatDate(student.enrollmentDate)}</p>
        {student.notes ? <p><b>ملاحظات:</b> {student.notes}</p> : null}
      </div>
      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-extrabold">رسوم التسجيل</h3><p className="mt-1 text-sm text-slate-600">{formatILS(enrollmentPayment?.amountPaid || 0)} من {formatILS(enrollmentPayment?.amountDue ?? student.enrollmentFee)} · {STATUS_LABELS[enrollmentPayment?.status || 'unpaid']}</p></div><Button onClick={() => onEnrollment(student, enrollmentPayment || emptyEnrollmentPayment(student))}>{enrollmentPayment?.status === 'paid' ? 'عرض الدفعة' : 'تسجيل الدفع'}</Button></div></div>
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
