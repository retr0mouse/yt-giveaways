import cors from 'cors';
import express, { Request, Response } from 'express';
import fetch from 'node-fetch';

const COMMENT_THREADS_API_URL = 'https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet';
const SUBSCRIPTIONS_API_URL = 'https://youtube.googleapis.com/youtube/v3/subscriptions?part=snippet';
const VIDEOS_API_URL = 'https://youtube.googleapis.com/youtube/v3/videos?part=snippet';
const API_KEY = 'AIzaSyCPEDr5QVi6rbthmGTmqowctbm7-kfe4IY'
const app = express();
const port = 3000;
app.use(cors());

app.get('/api/getComments', async (req: Request, res: Response) => {
    const videoUrl = req.query.videoUrl as string;
    try {
        const allComments = await fetchComments(videoUrl);
        const filteredComments = removeDuplicateComments(allComments);
        res.send(filteredComments);
    } catch (error: any) {
        console.error(error);
        res.status(500).send(error.message);
    }
});

async function fetchComments(videoUrl: string, pageToken?: string): Promise<any[]> {
    const videoId = videoUrl.split("?v=")[1];
    if (!videoId) throw new Error("The provided URL is invalid. It should be a YouTube video URL.");

    const response = await fetch(`${COMMENT_THREADS_API_URL}&videoId=${videoId}&key=${API_KEY}${pageToken ? `&pageToken=${pageToken}` : ''}`);

    if (!response.ok) throw new Error(`Failed to fetch comments: ${response.statusText}`);
    const commentThread = await response.json() as CommentThread;
    const allComments = commentThread.items.map(item => convertItemToComment(item));

    if (commentThread.nextPageToken) {
        const nextPageComments = await fetchComments(videoUrl, commentThread.nextPageToken);
        return allComments.concat(nextPageComments);
    }

    return allComments;
}

function removeDuplicateComments(comments: DisplayedComment[]) {
    const uniqueComments = new Map<string, DisplayedComment>();
    comments.forEach(comment => {
        if (!uniqueComments.has(comment.username)) {
            uniqueComments.set(comment.username, comment);
        }
    });
    return Array.from(uniqueComments.values());
}

function convertItemToComment(item: Item) {
    return {
        username: item.snippet.topLevelComment.snippet.authorDisplayName,
        userId: item.snippet.topLevelComment.snippet.authorChannelId.value,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        viewerRating: item.snippet.topLevelComment.snippet.viewerRating,
        likeCount: item.snippet.topLevelComment.snippet.likeCount
    } as DisplayedComment;
}

app.listen(port, () => {
    return "kek";
});

interface DisplayedComment {
    username: string,
    text: string,
    authorProfileImageUrl: string,
    viewerRating: string,
    likeCount: number
}

interface CommentThread {
    kind: string;
    etag: string;
    nextPageToken: string;
    pageInfo: PageInfo;
    items: Item[];
}

interface Item {
    kind: string;
    etag: string;
    id: string;
    snippet: ItemSnippet;
}

interface ItemSnippet {
    channelId: string;
    videoId: string;
    topLevelComment: TopLevelComment;
    canReply: boolean;
    totalReplyCount: number;
    isPublic: boolean;
}

interface TopLevelComment {
    kind: string;
    etag: string;
    id: string;
    snippet: TopLevelCommentSnippet;
}

interface TopLevelCommentSnippet {
    channelId: string;
    videoId: string;
    textDisplay: string;
    textOriginal: string;
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelUrl: string;
    authorChannelId: AuthorChannelId;
    canRate: boolean;
    viewerRating: string;
    likeCount: number;
    publishedAt: string;
    updatedAt: string;
}

interface AuthorChannelId {
    value: string;
}

interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
}