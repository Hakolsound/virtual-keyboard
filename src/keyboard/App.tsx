import { KeyboardProvider } from './context/KeyboardContext'
import { SettingsProvider } from './context/SettingsContext'
import VirtualKeyboard from './components/VirtualKeyboard'

export default function App() {
  return (
    <SettingsProvider>
      <KeyboardProvider>
        <VirtualKeyboard />
      </KeyboardProvider>
    </SettingsProvider>
  )
}
