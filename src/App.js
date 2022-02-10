import './App.css';
import axios from 'axios'
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams
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
  "url": "#",
  "kids": []
}

const App = () => {
  return (
    <div>
      <BrowserRouter basename="/rehn">
        <Header />
        <Routes>
          <Route path="/story/:id" element={<StoryItem />} />
          <Route path="/user/:username" element={<Profile />} />
          <Route path="/newest" element={<StoryList type="new" />} />
          <Route path="/best" element={<StoryList type="best" />} />
          <Route path="/top" element={<StoryList type="top" />} />
          <Route path="/ask" element={<StoryList type="ask" />} />
          <Route path="/show" element={<StoryList type="show" />} />
          <Route path="/job" element={<StoryList type="job" />} />
          <Route path="/newcomments" element={<CommentList />} />
          <Route path="/" element={<StoryList type="top" />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

const getItem = (itemID) => {
  const request = axios.get(`${url}item/${itemID}.json`)
  return request.then(response => response.data)
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
          const parentStory = await getParentStory(currentItem.id)
          currentItem.parentStory = parentStory
          currentItem.timeAgo = timeAgo(currentItem.time)
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
    if (currentItem.type === 'story')
      return currentItem
    else
      return getParentStory(currentItem.parent)
  }

  return (
    <>
      {comments.map(comment => (
        <>
        <div className="story-list">
          <article className="story-list-item" key={comment.id}>
            <h4><Link to={`/user/${comment.by}`}>{comment.by}</Link> {comment.timeAgo} ago | <a href={`https://news.ycombinator.com/item?id=${comment.parent}`}>parent</a> | <a href={`https://news.ycombinator.com/item?id=${comment.parentStory.id}#${comment.id}`}>context</a> | next | on : {comment.parentStory.title}</h4>
            <p dangerouslySetInnerHTML={setCommentHTML(comment.text)}></p>
          </article>
        </div>
        </>
      ))}
    </>
  )
}

const setCommentHTML = (commentHTML) => {
  // TODO: sanitize HTML w/ DOMpurify?
  return {__html: commentHTML}
}


const timeAgo = (unixTimestamp) => {
  // TODO: add hours/days ago if larger
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
          <h2><Link to={`/story/${story.id}`}>{story.title}</Link></h2> <a href={`${story.url}`}>{getWebsiteName(story.url)}</a>
          <p><em>{story.score}</em> points posted by <Link to={`/user/${story.by}`}>{story.by}</Link> {timeAgo(story.time)} ago | <Link to={`/story/${story.id}`}>{story.descendants} comments</Link></p>
        </article>
      ))}
    </div>
  )
}

const Profile = () => {
  return (
    <>
    </>
  )
}

const StoryItem = () => {
  const [story, setStory] = useState([dummyStory])
  const { id } = useParams()

  const fetchData = async (storyID) => {
    const story = await getItem(storyID)
    setStory(story)
    console.log('set story', story)
  }

  useEffect(() => {
    fetchData(id)
  }, [])

  return (
    <>
      <h1>{story.title}</h1>
      <p><em>{story.score}</em> points posted by <Link to={`/user/${story.by}`}>{story.by}</Link></p>

      <div className="comment-list">
        {story.kids?.map(kid => (
          <>
            <article className="comment-list-item">
              <Comment comment={kid} />
            </article>
          </>
        ))}
      </div>
    </>
  )
}

const Comment = ({comment}) => {
  const [commentData, setComment] = useState([dummyStory])

  const fetchComment = async (commentID) => {
    console.log('comment id', commentID)
    const comment = await getItem(commentID)
    setComment(comment)
  }

  useEffect(() => {
    fetchComment(comment)
  }, [])
  
  return (
    <>
      <article className="comment" key={commentData.id}>
        <h4><Link to={`/user/${commentData.by}`}>{commentData.by}</Link> {timeAgo(commentData.time)} ago</h4>
        <p dangerouslySetInnerHTML={setCommentHTML(commentData.text)}></p>
        {commentData.kids?.map(kid => (
          <Comment comment={kid} />
        ))}
      </article>
    </>
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
            <li><Link to="/newcomments">comments</Link></li>
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
