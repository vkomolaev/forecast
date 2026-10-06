interface ImportMetaEnv {
  readonly VITE_OWM_API_KEY?: string
  readonly VITE_CITIES_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
