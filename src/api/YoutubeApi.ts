import { DisplayedComment } from "../types/DisplayedComment";

const API_KEY = 'AIzaSyCPEDr5QVi6rbthmGTmqowctbm7-kfe4IY'

export class YoutubeApi {
    static async getRandomComment(videoId: string): Promise<DisplayedComment> {
        try {
            let allComments = [] as DisplayedComment[];
            const response = await fetch(`https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}`);

            if (!response.ok) { // if the fetch failed, throw an error
                throw new Error(response.statusText);
            }

            let currentThread = await response.json() as CommentThread;
            allComments = allComments.concat(currentThread.items.map(item => convertItemToComment(item)));

            while (currentThread.nextPageToken) {
                const data = await fetch(`https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&key=${API_KEY}&pageToken=${currentThread.nextPageToken}`);
                if (!data.ok) { // if the fetch failed, throw an error
                    throw new Error(data.statusText);
                }
                currentThread = await data.json() as CommentThread;
                allComments = allComments.concat(currentThread.items.map(item => convertItemToComment(item)));
            }

            if (allComments.length === 0) { // if there is no comments
                throw new Error(`No comments found for the given video`);
            }

            return allComments[Math.floor(Math.random() * allComments.length)];
        } catch (error) {
            console.error(error);
            console.log('kek');
            throw new Error(`An error occurred: ${error}`);
        }
    }
}


function convertItemToComment(item: Item) {
    return {
        text: item.snippet.topLevelComment.snippet.textDisplay,
        authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
        viewerRating: item.snippet.topLevelComment.snippet.viewerRating,
        likeCount: item.snippet.topLevelComment.snippet.likeCount
    } as DisplayedComment;
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