export function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">User Menu</span>
      </div>
    </header>
  );
}
