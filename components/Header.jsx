import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const { i18n } = useTranslation()
  const [lang, setLang] = useState('ru')

  useEffect(() => {
    // read from localStorage or default to 'ru'
    try {
      const saved = localStorage.getItem('aura_lang')
      const initial = saved || 'ru'
      setLang(initial)
      if (i18n.language !== initial) i18n.changeLanguage(initial)
    } catch (e) {
      // ignore
      if (i18n.language !== 'ru') i18n.changeLanguage('ru')
    }
  }, [])

  const change = (l) => {
    setLang(l)
    try { localStorage.setItem('aura_lang', l) } catch (e) { }
    i18n.changeLanguage(l)
  }

  return (
    <header style={{borderBottom: '1px solid #eee', padding: '10px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <div style={{fontWeight:700}}>
        Aura Beauty
      </div>
      <div>
        <button onClick={() => change('ru')} aria-pressed={lang==='ru'} style={{marginRight:8, padding:'6px 8px', background: lang==='ru' ? 'var(--brand)' : 'transparent', color: lang==='ru' ? '#fff' : 'inherit', border:'1px solid #ddd', borderRadius:6}}>RU</button>
        <button onClick={() => change('uz')} aria-pressed={lang==='uz'} style={{padding:'6px 8px', background: lang==='uz' ? 'var(--brand)' : 'transparent', color: lang==='uz' ? '#fff' : 'inherit', border:'1px solid #ddd', borderRadius:6}}>UZ</button>
      </div>
    </header>
  )
}
