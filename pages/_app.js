import '../styles/globals.css'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
import '../lib/i18n'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Header from '../components/Header'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const socket = io()
    window.__SOCKET__ = socket
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <>
      <Header />
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </>
  )
}

export default MyApp
