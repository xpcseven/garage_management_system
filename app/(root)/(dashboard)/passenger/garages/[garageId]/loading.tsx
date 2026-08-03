export default function loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-mist dark:bg-background">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-orchid/30 border-t-plum dark:border-orchid/40 dark:border-t-orchid-light" />
      <p className="mt-4 text-sm text-dusk/50 dark:text-muted-foreground">
        جاري تحميل الشركة…
      </p>
    </div>
  );
}
