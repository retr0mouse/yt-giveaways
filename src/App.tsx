import { useState } from 'react'
import './App.css'
import { YoutubeApi } from './api/YoutubeApi';
import { DisplayedComment } from './types/DisplayedComment';

function App() {
  const [comment, setComment] = useState<DisplayedComment | null>();
  const [videoId, setVideoId] = useState("");

  async function getData(id: string) {
    try {
      const pickedComment = await YoutubeApi.getRandomComment(id);
      if (!pickedComment) {
        console.error("No comment received from the API");
      } else {
        setComment(pickedComment);
      }
    } catch (error) {
      console.error("Error fetching data from the API:", error);
      setComment(null);
    }
  }



return (
  <>
    <div>
      {comment ?
        <div>
          <img className="pfp" src={comment.authorProfileImageUrl} alt="Profile picture" />
          <p className="comment-text">{comment.text}</p>
          <p className="like-count">Likes: {comment.likeCount}</p>
          <p className="rating">rating: {comment.viewerRating}</p>
        </div>
        :
        <p>Press the button to see a random comment</p>
      }
    </div>
    <div className="card">
      <input type="text" placeholder="Video id" value={videoId} onChange={(input) => setVideoId(input.target.value)} />
      <button onClick={() => videoId ? getData(videoId) : null}>
        Pick a winner
      </button>

    </div>
  </>
)
}

export default App
