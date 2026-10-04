import { useEffect, useState } from 'react'
import App from './App'
import ProjectDetail from './components/ProjectDetail'

// Adres "/#/proje/<slug>" ise proje sayfası, değilse ana sayfa açılır.
// Hash kullanıldığı için hosting tarafında ayar gerekmez.
const getSlug = () => {
  const m = window.location.hash.match(/^#\/proje\/([\w-]+)/)
  return m ? m[1] : null
}

export default function Router() {
  const [slug, setSlug] = useState(getSlug)

  useEffect(() => {
    const onChange = () => setSlug(getSlug())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return slug ? <ProjectDetail slug={slug} /> : <App />
}
