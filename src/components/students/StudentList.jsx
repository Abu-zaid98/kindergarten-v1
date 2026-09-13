import { SearchBar } from '../ui/SearchBar';
import { StudentCard } from './StudentCard';

function normalizeSearch(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .replace(/[\u0640\u200c]/g, '');
}

export function StudentList({ students, query, onQuery, onOpen, onEdit }) {
  const filtered = students.filter((s) => {
    const rawQuery = normalizeSearch(query);
    if (!rawQuery) return true;

    const fields = [
      s.fullName,
      s.guardianName,
      s.guardianRelation,
      s.phone1,
      s.phone2,
      s.classroom,
      s.notes,
    ].map(normalizeSearch);

    const tokens = rawQuery.split(' ').filter(Boolean);

    return fields.some((value) => {
      if (!value) return false;
      if (value.includes(rawQuery)) return true;
      return tokens.every((token) => value.includes(token));
    });
  });

  return (
    <div>
      <SearchBar value={query} onChange={onQuery} placeholder="بحث بالاسم أو ولي الأمر" />
      <div className="mt-4 grid gap-3">
        {filtered.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-center text-sm text-slate-500">لا يوجد طلاب مطابقون.</p>
        ) : (
          filtered.map((student) => (
            <StudentCard key={student.id} student={student} onOpen={onOpen} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  );
}
