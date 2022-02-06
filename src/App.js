import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom'

const url = 'https://hacker-news.firebaseio.com/v0/'
const dummyStory = {
  "by": "abc",
  "descendants": 0,
  "id": 999999,
  "score": 1,
  "time": 1644003922,
  "title": "Loading",
  "type": "story",
  "url": "#"
}

const App = () => {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/newest" element={<StoryList type="newest" />} />
          <Route path="/best" element={<StoryList type="best" />} />
          <Route path="/top" element={<StoryList type="top" />} />
          <Route path="/ask" element={<StoryList type="ask" />} />
          <Route path="/show" element={<StoryList type="show" />} />
          <Route path="/job" element={<StoryList type="job" />} />
          <Route path="/" element={<StoryList type="top" />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

const StoryList = ({type}) => {
  const [stories, setStories] = useState([dummyStory])

  const getStories = (type) => {
    let jsonFile = ''
    if (!type)
      jsonFile = 'topstories.json'
    else
      jsonFile = `${type}stories.json`
    
    const request = axios.get(url + jsonFile)
    return request.then(response => response.data)
  }
  
  const getStoryDetails = (stories) => {
    const requests = stories.map(story => axios.get(`${url}item/${story}.json`))
    axios.all(requests).then(axios.spread((...responses) => {
      setStories(responses.map(response => response.data))
    }))
  }

  useEffect(() => {
    getStories(type)
    .then(stories => {
      getStoryDetails(stories.slice(0, 10))
    })
    }, [type])

  return (
    <div className="story-list">
    {stories.map(story => (
      <article className="story-list-item" key={story.id}>
        <h2><a href={story.url}>{story.title}</a></h2>
        <p><em>{story.score}</em> points posted by <a href={`https://news.ycombinator.com/user?id=${story.by}`}>{story.by}</a> | {story.descendants} comments</p>
      </article>
    ))}
  </div>
  )
}

const Header = () => {
  return (
    <>
      <header>
        <nav>
          <ul>
            <li><Link to="/">Hacker News</Link></li>
            <li><Link to="/newest">new</Link></li>
            <li><a href="https://news.ycombinator.com/front">past</a></li>
            <li><a href="https://news.ycombinator.com/newcomments">comments</a></li>
            <li><Link to="/ask">ask</Link></li>
            <li><Link to="/show">show</Link></li>
            <li><Link to="/jobs">jobs</Link></li>
            {/* <li><a href="https://news.ycombinator.com/submit">submit</a></li> */}
          </ul>
        </nav>
      </header>
    </>
  )
}

const Footer = () => {
  return (
    <>
      <footer>
        <nav>
          <ul>
            <li><a href="https://news.ycombinator.com/newsguidelines.html">Guidelines</a></li>
            <li><a href="https://news.ycombinator.com/newsfaq.html">FAQ</a></li>
            <li><a href="https://news.ycombinator.com/lists">Lists</a></li>
            <li><a href="https://github.com/HackerNews/API">API</a></li>
            <li><a href="https://news.ycombinator.com/security.html">Security</a></li>
            <li><a href="http://www.ycombinator.com/legal/">Legal</a></li>
            <li><a href="http://www.ycombinator.com/apply/">Apply to YC</a></li>
            <li><a href="mailto:hn@ycombinator.com">Contact</a></li>
          </ul>
        </nav>
      </footer>
    </>
  )
}

export default App;
