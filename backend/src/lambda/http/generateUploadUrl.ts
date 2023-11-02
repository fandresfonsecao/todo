import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { generateSignedUrl,  updateAttachmentUrl} from '../../businessLogic/todos'
import { getUserId } from '../utils'
import TodoError from '../../utils/TodoError'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const attachmentId = uuid.v4()

    const res = generateSignedUrl(attachmentId)

    logger.info('Generating signed url ', res)

    if (res instanceof TodoError) {
      return {
        statusCode: res.code,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ msg: res.message })
      }
    }

    const uploadAttachmentUrlRes = await updateAttachmentUrl(
      userId,
      todoId,
      attachmentId
    )
    if (uploadAttachmentUrlRes instanceof TodoError) {
      return {
        statusCode: uploadAttachmentUrlRes.code,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ msg: uploadAttachmentUrlRes.message })
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ uploadUrl: res })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
