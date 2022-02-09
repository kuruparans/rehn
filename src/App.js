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
          <Route path="/newest" element={<StoryList type="new" />} />
          <Route path="/best" element={<StoryList type="best" />} />
          <Route path="/top" element={<StoryList type="top" />} />
          <Route path="/ask" element={<StoryList type="ask" />} />
          <Route path="/show" element={<StoryList type="show" />} />
          <Route path="/job" element={<StoryList type="job" />} />
          <Route path="/newcomments" element={<CommentList />} />
          <Route path="/rehn" element={<StoryList type="top" />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  )
}

const CommentList = () => {
  const [comments, setComments] = useState([dummyStory])

  const getMaxItemID = () => {
    const request = axios.get(url + 'maxitem.json')
    return request.then(response => response.data)
  }
  const getNewestStories = () => {
    const request = axios.get(url + 'newstories.json')
    return request.then(response => response.data)
  }
  const getItem = (itemID) => {
    const request = axios.get(`${url}item/${itemID}.json`)
    return request.then(response => response.data)
  }

  const fetchData = async () => {
    const maxItemID = await getMaxItemID()
    const newestStories = await getNewestStories()
    let currentItemID = maxItemID
    let comments = []
    let commentsPerPage = 10
    while (comments.length <= commentsPerPage) {
      if (!(currentItemID in newestStories)) {
        const currentItem = await getItem(currentItemID)
        if (currentItem.type === 'comment') {
          comments.push(currentItem)
        }
      }
      currentItemID--
    }
    setComments(comments)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const getParentStory = async (id) => {
    const currentItem = await getItem(id)
    console.log('cur item;', currentItem)
    if (currentItem.type === 'story')
      return currentItem
    else
      return getParentStory(currentItem.parent)
  }

  return (
    <>
      {comments.map(comment => (
        <>
        <div>{JSON.stringify(comment)}</div><div className="story-list">
          <article className="story-list-item" key={comment.id}>
            <h4><a href={`https://news.ycombinator.com/user?id=${comment.by}`}>{comment.by}</a> {timeAgo(comment.time)} ago | <a href={`https://news.ycombinator.com/item?id=${comment.parent}`}>parent</a> | <a href={`https://news.ycombinator.com/item?id=${getParentStory(comment.id).id}#${comment.id}`}>context</a> | next | on : Y</h4>
            <p>{comment.text}</p>
          </article>
        </div>
        </>
      ))}
    </>
  )
}

const timeAgo = (unixTimestamp) => {
  // TODO: fix
  const msMinute = 60*1000
  const timePosted = new Date(unixTimestamp * 1000)
  const timeNow = new Date()
  const timeDifference = timeNow - timePosted
  return Math.floor(timeDifference / msMinute) + ' minutes'
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

  const getWebsiteName = (url) => {
    let a = document.createElement('a')
    a.setAttribute('href', url)
    let hostName = a.hostname
    if (hostName.startsWith('www.'))
      return hostName.substring(4)
    else
      return hostName
  }

  return (
    <div className="story-list">
    {stories.map(story => (
      <article className="story-list-item" key={story.id}>
        <h2><a href={`https://news.ycombinator.com/item?id=${story.id}`}>{story.title}</a></h2> <a href={`${story.url}`}>{getWebsiteName(story.url)}</a>
        <p><em>{story.score}</em> points posted by <a href={`https://news.ycombinator.com/user?id=${story.by}`}>{story.by}</a> {timeAgo(story.time)} ago | <a href={`https://news.ycombinator.com/item?id=${story.id}`}>{story.descendants} comments</a></p>
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
            <li><Link to="newest">new</Link></li>
            <li><a href="https://news.ycombinator.com/front">past</a></li>
            <li><a href="/newcomments">comments</a></li>
            <li><Link to="ask">ask</Link></li>
            <li><Link to="show">show</Link></li>
            <li><Link to="jobs">jobs</Link></li>
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
