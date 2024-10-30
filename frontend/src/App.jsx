import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './LandingPage/Landing';
import CodeEditor from './CodeEditorPage/CodeEditor';

export default function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Landing/>} />
          <Route path='/editor/:roomId' element={<CodeEditor/>} />
          {/* <Route path='*' element={<Error404/>} /> */}
        </Routes>
      </Router>
    </div>
  )
}