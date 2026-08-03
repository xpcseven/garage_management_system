export default function loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-mist">
      <div className="h-14 w-14 rounded-full border-4 border-orchid/30 border-t-plum animate-spin" />
      <p className="mt-4 text-sm text-dusk/50">جاري تحميل المعلم…</p>
    </div>
  );
}
