import { getTodosByUserId,
         getTodoItem,
         createTodoItem,
         updateTodoItem,
         deleteTodoItem,
         updateAttachmentUrlInDb } from '../database/todosAccess'
import { getUploadUrl, getAttachmentUrl } from '../fileStorage/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

import TodoError from '../utils/TodoError'

// TODO: Implement businessLogic

const logger = createLogger('todosBusinessLogic')

export async function getTodos(
  userId: string
): Promise<TodoItem[] | TodoError> {
  try {
    const todos = await getTodosByUserId(userId)
    logger.info(`Todos of user: ${userId}`, JSON.stringify(todos))
    return todos
  } catch (error) {
    const errorMsg = `Error occurred when getting user's todos`
    logger.error(errorMsg)
    return new TodoError(errorMsg, 500)
  }
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem | TodoError> {
  const todoId = uuid.v4()

  const newItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: null,
    ...createTodoRequest
  }

  try {
    await createTodoItem(newItem)
    logger.info(`Todo ${todoId} for user ${userId}:`, {
      userId,
      todoId,
      todoItem: newItem
    })
    return newItem
  } catch (error) {
    const errorMsg = `Error occurred when creating user todo item`
    logger.error(errorMsg)
    return new TodoError(errorMsg, 500)
  }
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void | TodoError> {
  try {
    const item = await getTodoItem(todoId)

    if (!item) throw new TodoError('Item not found', 404)

    if (item.userId !== userId) {
      throw new TodoError('User is not authorized to update item', 403)
    }

    await updateTodoItem(todoId, updateTodoRequest as TodoUpdate)
    logger.info(`Updating todo ${todoId} for user ${userId}:`, {
      userId,
      todoId,
      todoUpdate: updateTodoRequest
    })
  } catch (error) {
    if (!error.code) {
      error.code = 500
      error.message = 'Error occurred when updating todo item'
    }
    logger.error(error.message)
    return error
  }
}

export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<void | TodoError> {
  try {
    const item = await getTodoItem(todoId)

    if (!item) throw new TodoError('Item not found', 404)

    if (item.userId !== userId) {
      throw new TodoError('User is not authorized to delete item', 403)
    }

    await deleteTodoItem(todoId)

    logger.info(`Deleting todo ${todoId} for user ${userId}:`, {
      userId,
      todoId
    })
  } catch (error) {
    if (!error.code) {
      error.code = 500
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export async function updateAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentId: string
): Promise<void | TodoError> {
  try {
    const attachmentUrl = await getAttachmentUrl(attachmentId)

    const item = await getTodoItem(todoId)

    if (!item) throw new TodoError('Item not found', 404)

    if (item.userId !== userId) {
      throw new TodoError('User is not authorized to update item', 403)
    }

    await updateAttachmentUrlInDb(todoId, attachmentUrl)

    logger.info(
      `Updating todo ${todoId} with attachment URL ${attachmentUrl}`,
      {
        userId,
        todoId
      }
    )
  } catch (error) {
    if (!error.code) {
      error.code = 500
      error.message = 'Error occurred when deleting todo item'
    }
    logger.error(error.message)
    return error
  }
}

export function generateSignedUrl(attachmentId: string): string | TodoError {
  try {
    const uploadUrl = getUploadUrl(attachmentId)
    logger.info(`Presigned Url is generated: ${uploadUrl}`)

    return uploadUrl
  } catch (error) {
    const errorMsg = 'Error occurred when generating presigned Url to upload'
    logger.error(errorMsg)
    logger.error(error)
    return new TodoError(errorMsg, 500)
  }
}