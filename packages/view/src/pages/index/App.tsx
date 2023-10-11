
import './App.css'
import debug from 'debug'
import { BaseLayout } from '@layouts/BaseLayout'

debug.enable(`*`)

export default function App () {
  return (
    <BaseLayout />
  )
}