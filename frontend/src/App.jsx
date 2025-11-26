import React, { useState } from 'react'
import Draw from './pages/Draw'
import ChatApp from './pages/Chat'

const App = () => {
  const [board, setBoard] = useState(true);
  const onClick = () => {
    setBoard(!board);
  }
  return (
    <div>
      {/* <button onClick={onClick}>
        {board ? "Chat" : "Draw"}
      </button> */}
      {/* <Draw/> */}
      {/* {
        board ? <Draw/> : <ChatApp/>
      } */}
      <ChatApp/>
    </div>
  )
}

export default App
