import { useState } from 'react'
import WeddingPage from './WeddingPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <WeddingPage></WeddingPage>
    </>
  )
}

export default App
