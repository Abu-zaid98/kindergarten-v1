import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useClassrooms } from '../hooks/useClassrooms';
import { useStudents } from '../hooks/useStudents';
import { deleteClassroom, saveClassroom } from '../db/classrooms';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useNavigate } from 'react-router-dom';

export function ClassroomsPage() {
  const { classrooms } = useClassrooms();
  const { students } = useStudents();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const counts = useMemo(() => {
    const next = new Map();
    students
      .filter((student) => student.isActive !== false && student.classroomId)
      .forEach((student) => next.set(student.classroomId, (next.get(student.classroomId) || 0) + 1));
    return next;
  }, [students]);

  async function submit(e) {
    e.preventDefault();
    try {
      await saveClassroom({ ...(editing || {}), name });
      setName(''); setEditing(null); setError('');
    } catch (err) { setError(err.message); }
  }
  function startEdit(item) { setEditing(item); setName(item.name); setError(''); }

  return <div>
    <div className="mb-5"><h2 className="text-xl font-extrabold">إدارة الفصول</h2><p className="text-sm text-slate-500">أضف الفصول وسمّها، ثم انسِب الطلاب إليها من نموذج الطالب.</p></div>
    <form onSubmit={submit} className="mb-5 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><Input className="flex-1" label={editing ? 'تعديل اسم الفصل' : 'اسم الفصل الجديد'} value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: التمهيدي أ" required />
        <div className="flex gap-2"><Button type="submit"><Plus size={16} />{editing ? 'حفظ التعديل' : 'إضافة فصل'}</Button>{editing && <Button type="button" variant="secondary" onClick={() => { setEditing(null); setName(''); setError(''); }}>إلغاء</Button>}</div>
      </div>{error && <p className="mt-2 text-sm font-bold text-red-600">{error}</p>}
    </form>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {classrooms.map((room) => <div key={room.id} className="rounded-3xl bg-white p-4 shadow-sm">
        <button type="button" onClick={() => navigate(`/students?classroom=${room.id}`)} className="w-full text-right"><div className="flex items-start justify-between"><span className="rounded-2xl bg-blue-50 p-2 text-blue-600"><Users size={20} /></span><span className="text-sm font-extrabold text-blue-700">{counts.get(room.id) || 0} طالب</span></div><h3 className="mt-4 text-lg font-extrabold">{room.name}</h3><p className="mt-1 text-sm text-slate-500">عرض طلاب هذا الفصل</p></button>
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3"><button onClick={() => startEdit(room)} className="text-xs font-bold text-blue-600"><Pencil size={14} className="ml-1 inline" />تعديل</button><button onClick={() => setDeleteTarget(room)} className="text-xs font-bold text-red-600"><Trash2 size={14} className="ml-1 inline" />حذف</button></div>
      </div>)}
      {classrooms.length === 0 && <p className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500 sm:col-span-2">لم تُضف أي فصول بعد.</p>}
    </div>
    <ConfirmModal open={!!deleteTarget} title="حذف فصل" message={`سيُزال الفصل «${deleteTarget?.name}» من الطلاب المنسوبين إليه، دون حذف الطلاب أو سجلاتهم.`} confirmLabel="حذف الفصل" cancelLabel="إلغاء" danger onConfirm={async () => { await deleteClassroom(deleteTarget.id); setDeleteTarget(null); }} onClose={() => setDeleteTarget(null)} />
  </div>;
}
