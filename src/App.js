import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'
import StoryList from './components/StoryList'
import Story from './components/Story'
import NewCommentList from './components/NewCommentList'
import User from './components/User'

const App = () => {
  return (
    <div className="container">
      <BrowserRouter basename="/rehn">
        <Header />
        <section className="main-content">
          <Routes>
            <Route path="/story/:id" element={<Story />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="/newest" element={<StoryList type="new" />} />
            <Route path="/best" element={<StoryList type="best" />} />
            <Route path="/top" element={<StoryList type="top" />} />
            <Route path="/ask" element={<StoryList type="ask" />} />
            <Route path="/show" element={<StoryList type="show" />} />
            <Route path="/newcomments" element={<NewCommentList />} />
            <Route path="/" element={<StoryList type="top" />} />
          </Routes>
        </section>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App