import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react';
const url = 'https://hacker-news.firebaseio.com/v0/'

const App = () => {
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
  const [stories, setStories] = useState([dummyStory])
  const [storiesPerPage, setStoriesPerPage] = useState(10)

  const getNewStories = () => {
    const request = axios.get(url + 'newstories.json')
    return request.then(response => response.data)
  }

  const getTopStories = () => {
    const request = axios.get(url + 'topstories.json')
    return request.then(response => response.data)
  }

  const getBestStories = () => {
    const request = axios.get(url + 'beststories.json')
    return request.then(response => response.data)
  }

  const getStoryDetails = (stories) => {
    const requests = stories.map(story => axios.get(`${url}item/${story}.json`))
    axios.all(requests).then(axios.spread((...responses) => {
      setStories(responses.map(response => response.data))
    }))
  }

  useEffect(() => {
    getBestStories()
      .then(stories => {
        getStoryDetails(stories.slice(0, storiesPerPage))
      })
  }, [])

  return (
    <div>
      <header>
        <nav>
          <ul>
            <li><a href="/">Hacker News</a></li>
            <li><a href="https://news.ycombinator.com/newest">new</a></li>
            <li><a href="https://news.ycombinator.com/front">past</a></li>
            <li><a href="https://news.ycombinator.com/newcomments">comments</a></li>
            <li><a href="https://news.ycombinator.com/ask">ask</a></li>
            <li><a href="https://news.ycombinator.com/show">show</a></li>
            <li><a href="https://news.ycombinator.com/jobs">jobs</a></li>
            <li><a href="https://news.ycombinator.com/submit">submit</a></li>
          </ul>
        </nav>
      </header>
      
      <div className="story-list">
        {stories.map(story => (
          <article className="story-list-item" key={story.id}>
            <h2><a href={story.url}>{story.title}</a></h2>
            <p><em>{story.score}</em> points posted by <a href={`https://news.ycombinator.com/user?id=${story.by}`}>{story.by}</a> | {story.descendants} comments</p>
          </article>
        ))}
      </div>

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
    </div>
  )
}

export default App;
