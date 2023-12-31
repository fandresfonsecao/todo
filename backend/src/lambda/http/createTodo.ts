import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import TodoError from '../../utils/TodoError'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('createTodo event', { event })
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item

    const userId = getUserId(event)
    const res = await createTodo(userId, newTodo)
    let statusCode
    let body
    if (res instanceof TodoError) {
      statusCode = res.code
      body = JSON.stringify({ msg: res.message })
    } else {
      statusCode = 201
      body = JSON.stringify({
        item: {
          ...res
        }
      })
    }
    return {
      statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
