const AWS = require("aws-sdk");
AWS.config.update( {
  region: "us-east-1"
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = "PawPlanner-V2";

const toDoPath = "/to-do";
const toDoUserPath = "/to-do/user";
const userPath = "/user"

//Paths for different 
const completedCount = "/to-do/completedCount";
const incompletedCount = "/to-do/incompletedCount";

//item types
const todoType = "to-do";
const userType  = "user";


function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getID(){
  console.log("trying to match the id")
  let counter = 0

  while(true){
  counter += 1
  if(counter > 50){
    return -1
  }
  let testNumber = getRandomNumber(11111, 99999)
  //params to be passed in to specify what items we want
  const params = {
    TableName: dynamodbTableName,
    FilterExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': testNumber
    }
  };

  //queries the DB according to our params
  const allItemsList = await scanDynamoRecords(params, []);

  if(allItemsList.length == 0){
    return testNumber
  }
} 
}

exports.handler = async function(event) {
  let response;
  
  console.log(event)

  switch(true) {

    case event.httpMethod.toUpperCase() === "GET" && event.requestContext.resourcePath === userPath:
      response = await getItem(userType);
      break;
    
    //will get all to-dos for specific user
    case event.httpMethod.toUpperCase() === "GET" && event.requestContext.resourcePath.startsWith("/user/validate"):
      response = await validateUser(event.queryStringParameters.username, event.queryStringParameters.password, userType);
      break;
      
    case event.httpMethod.toUpperCase() === "POST" && event.requestContext.resourcePath === userPath:
      try {
        const parsedBody = JSON.parse(event.body);
        // Validate the item by checking each field
        if (
          'username' in parsedBody &&
          'password' in parsedBody
        ) {
          // each field is present Proceed with saving the item
          response = await saveItem(JSON.parse(event.body), userType);
        } else {
          // will be returned if any required feilds are missing
          response = buildResponse(400, { message: "Missing fields in the body" });
        }
      }catch (error) {
        // will be returned if any errors parsing json
        response = buildResponse(400, { message: "Invalid JSON in the request body" });
      }
      break;

      
      case event.httpMethod.toUpperCase() === "POST" && event.requestContext.resourcePath === toDoPath:
        try {
          const parsedBody = JSON.parse(event.body);
          
          // Validate the item by checking each field
          if (
            'title' in parsedBody &&
            'description' in parsedBody &&
            'repeating' in parsedBody &&
            'finishDate' in parsedBody &&
            'userID' in parsedBody &&
            'priority' in parsedBody &&
            'link' in parsedBody
          ) {
            // Add the 'completed' field with value 'false'
            parsedBody.completed = "false";
            
            // each field is present Proceed with saving the item
            response = await saveItem(parsedBody, todoType);
          } else {
            // will be returned if any required fields are missing
            response = buildResponse(400, { message: "Missing fields in the body" });
          }
        } catch (error) {
          // will be returned if any errors parsing json
          response = buildResponse(400, { message: "Invalid JSON in the request body" });
        }
        break;
      

    case event.httpMethod.toUpperCase() === "PATCH" && event.requestContext.resourcePath === toDoPath:
      try {
        console.log("we are really tring to patch")
        const parsedBody = JSON.parse(event.body);
        
        // Validate the item by checking each field
        if (
          'id' in parsedBody &&
          'updateKey' in parsedBody &&
          'updateValue' in parsedBody
        ) {
          // each field is present Proceed with patching the item
          response = await editItem(parsedBody.id, parsedBody.updateKey, parsedBody.updateValue, todoType);

        } else {
          // will be returned if any required feilds are missing
          response = buildResponse(400, { message: "Missing fields in the body" });
        }
      } catch (error) {
        // will be returned if any errors parsing json
        response = buildResponse(400, { message: "Invalid JSON in the request body" });
      }
      break;
      
    case event.httpMethod.toUpperCase() === "GET" && event.requestContext.resourcePath === toDoPath:
      response = await getItem(todoType);
      break;

    //will get all to-dos for specific user
    case event.httpMethod.toUpperCase() === "GET" && event.requestContext.resourcePath.startsWith(toDoUserPath):
      response = await getUserItems(event.queryStringParameters.userID, todoType);
      break;

    case event.httpMethod.toUpperCase() === "GET" && event.requestContext.resourcePath.startsWith(completedCount):
      console.log("HERE IT IS: " + event)
      response = await countItem(todoType, true, event.queryStringParameters.user);
      break;
    
    case event.httpMethod.toUpperCase() === "GET" && event.requestContext.resourcePath.startsWith(incompletedCount):
      response = await countItem(todoType, false, event.queryStringParameters.user);
      break;

    case event.httpMethod.toUpperCase() === "DELETE" && event.requestContext.resourcePath.startsWith(toDoPath):  
    if(event.queryStringParameters.all == "yes"){
      response = await deleteItem(event.queryStringParameters.id, todoType, true);
    }   
    else{
      response = await deleteItem(event.queryStringParameters.id, todoType, false);
    } 
    break;


    //if the request doesnt match any
    default:
      response = buildResponse(404, event.requestContext.resourcePath);
   
  }
  
  return response;
}

async function editItem(ItemId, updateKey, updateValue, itemTypeString) {

  // params to Check if the item exists before attempting to update
  const checkParams = {
    TableName: dynamodbTableName,
    KeyConditionExpression: 'id = :pk and itemType = :sk',
    ExpressionAttributeValues: {
      ':pk': ItemId, 
      ':sk': itemTypeString
    }
  };

  try {
    //queries the DB according to our params
    const checkResponse = await dynamodb.query(checkParams).promise();
    if (checkResponse.Items.length === 0) {
      // Item not found, return 404
      return buildResponse(404, { message: `Item with ID ${ItemId} not found` });
    }

    // Item exists, proceed with the update according to these params
    const updateParams = {
      TableName: dynamodbTableName,
      Key: {
        "id": ItemId,
        "itemType": itemTypeString
      },
      UpdateExpression: `set ${updateKey} = :value`,
      ExpressionAttributeValues: {
        ":value": updateValue
      },
      ReturnValues: "UPDATED_NEW"
    };

    //updates item in the DB according to our params
    const response = await dynamodb.update(updateParams).promise();
    const body = {
      Operation: "UPDATE",
      Message: "SUCCESS",
      UpdatedAttributes: response
    };

    return buildResponse(200, body);

  } catch (error) {
    console.error("Unexpected error!", error);

    // Check the error type and return different responses accordingly
    if (error.statusCode) {
      return buildResponse(error.statusCode, { message: error.message });
    } else {
      return buildResponse(500, { message: "Internal server error" });
    }
  }
}

async function validateUser(username, password, itemType) {
  //params to be passed in to specify what items we want
  const params = {
    TableName: dynamodbTableName,
    FilterExpression: 'itemType = :sk AND password = :password AND username = :username',
    ExpressionAttributeValues: {
      ':sk': itemType,
      ':username': username,
      ':password': password
    }
  };

  //queries the DB according to our params
  const allItemsList = await scanDynamoRecords(params, []);

  let counter = allItemsList.length

  let result = false;
  if(counter > 0){
    result = true
  }

  const body = {
    isLoggedIn: result
  };

  return buildResponse(200, body);

}


async function getItem(itemTypeString) {

  //params to be passed in to specify what items we want
  const params = {
    TableName: dynamodbTableName,
    FilterExpression: 'begins_with(itemType, :sk)',
    ExpressionAttributeValues: {
      ':sk': itemTypeString
    }
  };
  //queries the DB according to our params
  const allItemsList = await scanDynamoRecords(params, []);

  const body = {
    items: allItemsList
  };

  return buildResponse(200, body);
}

async function getUserItems(userID, itemTypeString) {
  // Params to be passed in to specify what items we want
  const params = {
    TableName: dynamodbTableName,
    FilterExpression: 'itemType = :sk AND userID = :userID',
    ExpressionAttributeValues: {
      ':sk': itemTypeString,
      ':userID': userID
    }
  };

  try {
    // Query the DB according to our params
    const allItemsList = await scanDynamoRecords(params, []);

    const body = {
      items: allItemsList
    };

    return buildResponse(200, body);
  } catch (error) {
    console.error("Error getting user items:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
}




async function saveItem(requestBody, itemTypeString) {
  //appends a sort key of the item in order to differntiate
  const randomNum = await getID()
  requestBody.itemType = itemTypeString
  requestBody.id = randomNum.toString()

  //params to be passed in to specify what item we want
  const params = {
    TableName: dynamodbTableName,
    Item: requestBody
  };


  //posts item the DB according to our params
  return await dynamodb.put(params).promise().then(() => {
    const body = {
      Operation: "SAVE",
      Message: "SUCCESS",
      Item: requestBody
    };
    return buildResponse(200, body);

  }, (error) => {
    console.error("Unexpected error!", error);

    // Check the error type and return different responses accordingly
    if (error.statusCode) {
      return buildResponse(error.statusCode, { message: error.message });
    } else {
      return buildResponse(500, { message: "Internal server error" });
    }

  });
}


//will scan the db
async function scanDynamoRecords(scanParams, itemArray) {
  try {
    //queries the DB according to our params
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartkey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    return itemArray;

  } catch(error) {
    console.error("Unexpected error!", error);

    // Check the error type and return different responses accordingly
    if (error.statusCode) {
      return buildResponse(error.statusCode, { message: error.message });
    } else {
      return buildResponse(500, { message: "Internal server error" });
    }
  }
}

//builds a response to send back after a request is recieved
function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
 };

}


async function countItem(itemTypeString, foundBool, user) {
  try {
    // Params to be passed in to specify what items we want
    const params = {
      TableName: dynamodbTableName,
      FilterExpression: 'completed = :val AND userID = :userID',
      ExpressionAttributeValues: {
        ':val': foundBool.toString(),
        ':userID': user.toString()
      }
    };

    // Queries the DB according to our params
    const allItemsList = await scanDynamoRecords(params, []);

    const counter = allItemsList.length;

    const body = {
      count: counter
    };

    return buildResponse(200, body);
  } catch (error) {
    console.error("Error in countItem:", error);
    return buildResponse(500, { message: "Internal server error" });
  }
}

async function deleteItem(ItemId, itemTypeString, deleteAll) {
  if (!ItemId) {
    // If ItemId is not provided, return a 400 Bad Request response
    return buildResponse(400, { message: "ItemId is required" });
  }

  let scanParams;

  if (!deleteAll) {
    // Scan for the specific item to delete
    scanParams = {
      TableName: dynamodbTableName,
      FilterExpression: 'id = :pk and itemType = :sk',
      ExpressionAttributeValues: {
        ':pk': ItemId,
        ':sk': itemTypeString
      }
    };
  } else {
    // Scan for all items of the specified type
    scanParams = {
      TableName: dynamodbTableName,
      FilterExpression: 'itemType = :sk',
      ExpressionAttributeValues: {
        ':sk': itemTypeString
      }
    };
  }

  try {
    console.log("Scanning DynamoDB table...");

    // Scan the table according to the parameters
    const scanResponse = await dynamodb.scan(scanParams).promise();

    if (scanResponse.Items.length === 0) {
      // No items found, return 404
      return buildResponse(404, { message: `No items found for deletion` });
    }

    // Perform deletion for each item found
    for (const item of scanResponse.Items) {
      const deleteParams = {
        TableName: dynamodbTableName,
        Key: {
          "id": item.id,
          "itemType": item.itemType
        },
        ReturnValues: "ALL_OLD"
      };

      // Delete the item from the table
      await dynamodb.delete(deleteParams).promise();
    }

    console.log("Deletion successful");
    return buildResponse(200, { message: "Deletion successful" });
  } catch (error) {
    console.error("Unexpected error:", error);

    // Return appropriate response based on error type
    if (error.statusCode) {
      return buildResponse(error.statusCode, { message: error.message });
    } else {
      return buildResponse(500, { message: "Internal server error" });
    }
  }
}

