import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { generateSignedUrl} from '../../businessLogic/todos'
import TodoError from '../../utils/TodoError'
import { createLogger } from '../../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('getSignedUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    event.headers
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
