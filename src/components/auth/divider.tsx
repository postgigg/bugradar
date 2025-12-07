export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-slate-50 px-4 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          or continue with email
        </span>
      </div>
    </div>
  )
}
