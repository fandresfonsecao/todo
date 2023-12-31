import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
//import * as AWSXRay from "aws-xray-sdk-core";
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const logger = createLogger('TodosDataLayer')

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the dataLayer logic

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE
const todosByUserIndex = process.env.TODOS_BY_USER_INDEX

export async function todoItemExists(todoId: string): Promise<boolean> {
  const item = await getTodoItem(todoId)
  return !!item
}

export async function getTodosByUserId(userId: string): Promise<TodoItem[]> {
  const result = await docClient
    .query({
      TableName: todosTable,
      IndexName: todosByUserIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  const items = result.Items

  logger.info(`All todos for user ${userId} were fetched`)

  return items as TodoItem[]
}

export async function getTodoItem(todoId: string): Promise<TodoItem> {
  const result = await docClient
    .get({
      TableName: todosTable,
      Key: {
        todoId
      }
    })
    .promise()

  const item = result.Item

  logger.info(`Todo item ${item} was fetched`)

  return item as TodoItem
}

export async function createTodoItem(todoItem: TodoItem): Promise<void> {
  await docClient
    .put({
      TableName: todosTable,
      Item: todoItem
    })
    .promise()

  logger.info(`Todo item ${todoItem.todoId} was created`)
}

export async function updateTodoItem(
  todoId: string,
  todoUpdate: TodoUpdate
): Promise<void> {
  await docClient
    .update({
      TableName: todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      }
    })
    .promise()

  logger.info(`Todo item ${todoId} was updated`)
}

export async function deleteTodoItem(todoId: string): Promise<void> {
  await docClient
    .delete({
      TableName: todosTable,
      Key: {
        todoId
      }
    })
    .promise()

  logger.info(`Todo item ${todoId} deleted!`)
}

export async function updateAttachmentUrlInDb(
  todoId: string,
  attachmentUrl: string
): Promise<void> {
  await docClient
    .update({
      TableName: todosTable,
      Key: {
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
    .promise()

  logger.info(`Attachment URL for todo ${todoId} was updated`)
}