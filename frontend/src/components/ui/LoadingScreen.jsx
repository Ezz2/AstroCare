import useLanguage from '../../i18n/useLanguage'

export default function LoadingScreen() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-space-600 border-t-cyan-400" role="status">
        <span className="sr-only">{t("Loading")}</span>
      </div>
    </div>
  )
}
