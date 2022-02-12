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
          {/* <Route path="/jobs" element={<StoryList type="job" />} /> */}
          <Route path="/newcomments" element={<NewCommentList />} />
          <Route path="/" element={<StoryList type="top" />} />
        </Routes>
        </section>
        <Footer />
      </BrowserRouter>
    </div>
  )
}

const getItem = (itemID) => {
  const request = axios.get(`${url}item/${itemID}.json`)
  return request.then(response => response.data)
}

const NewCommentList = () => {
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
          <article className="story-list-item" key={comment?.id}>
          <span className="comment-header"><h4><Link to={`/user/${comment?.by}`}>{comment?.by}</Link> |
            &nbsp;{comment?.timeAgo} ago | 
            &nbsp;<Link to={`/story/${comment?.parentStory?.id}#${comment?.parent}`}>parent</Link> | 
            &nbsp;<Link to={`/story/${comment?.parentStory?.id}#${comment?.id}`}>context</Link> | 
            on : <Link to={`/story/${comment?.parentStory?.id}`}>{comment?.parentStory?.title}</Link></h4></span>
            <p dangerouslySetInnerHTML={setCommentHTML(comment?.text)}></p>
          </article>
        </div>
        </>
      ))}
    </>
  )
}

// <span className="comment-header"><h4><Link to={`/user/${commentData.by}`}>{commentData.by}</Link></h4> |
//         {timeAgo(commentData.time)} ago</span>

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
          <h3><Link to={`/story/${story.id}`}>{story.title}</Link></h3> 
          <span className="story-link">
            ({!story.url
              ? <span>self.hn</span>
              : <a href={`${story.url}`}>{getWebsiteName(story.url)}</a>
            })
            </span>
          <p><em>{story.score}</em> points |
          posted by <Link to={`/user/${story.by}`}>{story.by}</Link> |
          &nbsp;{timeAgo(story.time)} ago |
          &nbsp;<Link to={`/story/${story.id}`}>{story.descendants} comments</Link></p>
        </article>
      ))}
    </div>
  )
}

const User = () => {
  const dummyUser = {
    "about" : "This is a test",
    "created" : 1173923446,
    "delay" : 0,
    "id" : "jl",
    "karma" : 0,
    "submitted" : []
  }  
  const { username } = useParams()
  const [user, setUser] = useState([dummyUser])
  const [submissions, setSubmissions] = useState([dummyStory])

  const getUser = () => {
    const request = axios.get(`${url}/user/${username}.json`)
    return request.then(response => response.data)
  }

  const fetchData = async () => {
    const user = await getUser()
    setUser(user)
    const submissionPromises = user.submitted.map(submittedID => getItem(submittedID))
    const submissions = await Promise.all(submissionPromises)
    setSubmissions(submissions)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <>
      <h2>{user.id}</h2>
      <p>EST: {Date(user.created * 1000)}</p>
      <p>Karma: {user.karma}</p>
      <h3>Submissions</h3>
      {submissions?.filter(submission => submission.type === 'story').map(submission => (
        <>
          <StoryInfo storyID={submission.id} />
        </>
      ))}
      <h3>Comments</h3>
      {submissions?.filter(submission => submission.type === 'comment').map(comment => (
        <>
          <Comment comment={comment.id} nestLimit="2" />
        </>
      ))}
    </>
  )
}

const Story = () => {
  const [story, setStory] = useState([dummyStory])
  const { id } = useParams()

  const fetchData = async (storyID) => {
    const story = await getItem(storyID)
    setStory(story)
  }

  useEffect(() => {
    fetchData(id)
  }, [])

  return (
    <>
      <div className="story">
        <StoryInfo storyID={story.id} key={story.id} />

        <div className="comment-list">
          {story.kids?.map(kid => (
            <>
              <article className="comment-list-item">
                <Comment comment={kid} key={kid} />
                {/* TODO: display alt message if no comments? */}
              </article>
            </>
          ))}
        </div>
      </div>
    </>
  )
}

const StoryInfo = ({storyID}) => {
  const [story, setStory] = useState([dummyStory])

  useEffect(() => {
    const fetchData = async () => {
      const story = await getItem(storyID)
      setStory(story)
    }
    fetchData()
  }, [storyID])

  return (
    <>
      <div className="story-info">
        <h1><a href={story?.url}>{story?.title}</a></h1>
        {story?.text !== '' &&
          <p dangerouslySetInnerHTML={setCommentHTML(story?.text)}></p>
        }
        <p className="story-info-footer"><em>{story?.score}</em> points | posted by <Link to={`/user/${story?.by}`}>{story?.by}</Link> | {story?.descendants} comments</p>
      </div>
    </>
  )
}

const Comment = ({comment, nestLimit=0}) => {
  const [commentData, setComment] = useState([dummyStory])

  const fetchComment = async (commentID) => {
    const comment = await getItem(commentID)
    setComment(comment)
  }

  useEffect(() => {
    fetchComment(comment)
  }, [])

  // TODO: add nestLimit
  
  return (
    <>
      <article className="comment" key={commentData.id}>
        <a name={`#${commentData.id}`}></a>
        <Link to={`#${commentData.id}`} className="comment-border-link">
            <span className="sr-only">Jump to comment-1</span>
        </Link>
        <span className="comment-header"><h4><Link to={`/user/${commentData.by}`}>{commentData.by}</Link></h4> |
        {timeAgo(commentData.time)} ago</span>
        <p dangerouslySetInnerHTML={setCommentHTML(commentData.text)}></p>
        {commentData.kids?.map(kid => (
          <Comment comment={kid} key={kid} />
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
            <li><Link to="/best"><img src="https://news.ycombinator.com/y18.gif" className="nav-logo" /></Link></li>
            <li><Link to="/"><strong>Hacker News</strong></Link></li>
            <li><Link to="/newest">new</Link></li>
            {/* <li><a href="https://news.ycombinator.com/front">past</a></li> */}
            <li><Link to="/newcomments">comments</Link></li>
            <li><Link to="/ask">ask</Link></li>
            <li><Link to="/show">show</Link></li>
            {/* <li><Link to="/jobs">jobs</Link></li> */}
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
