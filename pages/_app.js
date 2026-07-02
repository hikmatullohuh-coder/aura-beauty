import '../styles/globals.css'
import { useEffect } from 'react'
import { io } from 'socket.io-client'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // connect socket client to receive admin notifications (only for admin pages)
    if (typeof window === 'undefined') return
    const socket = io()
    window.__SOCKET__ = socket
    return () => {
      socket.disconnect()
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
