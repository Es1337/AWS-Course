import { Context, APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid'

interface Video {
    id: string;
    title: string;
}

// for now we will store our videos in the memory
const videosStore: Video[] = [
    {
        id: '1',
        title: 'cheese is good'
    },
    {
        id: '2',
        title: 'bread is also good'
    }
]

function listVideos(): Video[] {
    return videosStore
}

function findVideo(id: string): Video | undefined {
    return videosStore.find((video) => video.id === id)
}

function createVideo(title: string) {
    const newVideo = {
        id: uuid(),
        title
    }

    videosStore.push(newVideo)
    return newVideo
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    // logging event is helpful when developing
    console.log(event)
    const { resource, httpMethod } = event;
    
    // event contains information about the API resource
    if (resource === '/videos' && httpMethod === 'GET') {
        // retrieve videos
        const videos = listVideos()
        
        // return response
        return {
            statusCode: 200,
            body: JSON.stringify({ videos })
        };
    }
    
    // in case someone tries to call our lambda with unknown resource return 404
    return {
        statusCode: 404,
        body: 'NotFound'
    };
}