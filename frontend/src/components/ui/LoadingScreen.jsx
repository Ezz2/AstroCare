export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-space-600 border-t-cyan-400" role="status">
        <span className="sr-only">Loading</span>
      </div>
    </div>
  )
}
