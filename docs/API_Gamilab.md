# ReDoc

-   Gami API
    -   Gami SDK
    -   Workflow Overview
    -   Data Flow
    -   Authorization
-   Workspaces
    -   getList workspaces
    -   getShow workspace
-   Models
    -   delDelete model
    -   getShow model
    -   patchUpdate model
    -   putUpdate model
    -   getList models in workspace
    -   postCreate model
-   Extractions
    -   delDelete extraction
    -   getShow extraction
    -   getList extractions in workspace
    -   postCreate extraction
-   Portals
    -   delDelete portal
    -   getShow portal
    -   patchUpdate portal
    -   putUpdate portal
    -   getList portals in workspace
    -   postCreate portal
-   Threads
    -   getList threads for portal
    -   postCreate thread
    -   delDelete thread
    -   getShow thread
    -   getGet resolved thread struct
    -   getGet full transcript
    -   getList events for thread

[![redocly logo](https://cdn.redoc.ly/redoc/logo-mini.svg)API docs by Redocly](https://redocly.com/redoc/)

# gami (1.1.3)

Download OpenAPI specification:[Download](https://gamilab.ch/api/v1/openapi)

## [](#section/Gami-API)Gami API

The Gami API provides a streamlined workflow for transforming unstructured data into schema-compliant structured data using a simplified extraction-based architecture.

## [](#section/Gami-API/Gami-SDK)Gami SDK

The browser SDK provides an easy way to use the Gami API.

[Browser SDK documentation](/api/docs/sdk/index.html)

## [](#section/Gami-API/Workflow-Overview)Workflow Overview

**1\. Model Creation**

-   Define a **model** with its associated **schema** (extended JSON Schema format)
-   The schema specifies the structure, data types, and validation rules for the desired output format

**2\. Extraction Creation**

-   Create a **extraction** - a self-contained processing unit that manages the complete transformation workflow
-   Each extraction is linked to a model and contains both input data and processing results

**3\. Input Data Submission**

-   Submit **input data** directly to the extraction
-   Input can be provided as raw text or structured JSON data
-   The extraction stores the input data for processing

**4\. Processing Execution**

-   Extractions are automatically queued and processed according to the model schema
-   The system handles the data transformation from unstructured to structured format
-   Processing status is tracked throughout the extraction lifecycle

**5\. Output Retrieval**

-   Completed extractions contain the **structured output** that conforms to your defined schema
-   Results are directly accessible from the extraction, maintaining clear linkage between input and output

## [](#section/Gami-API/Data-Flow)Data Flow

```
Model Schema → Extraction (Input Data) → Processing → Extraction (Output Results)
```

This streamlined workflow eliminates intermediate steps while maintaining complete traceability between raw input and structured output within each extraction.

## [](#section/Gami-API/Authorization)Authorization

All API requests require authentication using a Bearer token. Include your API key in the `Authorization` header with the following format:

```
Authorization: Bearer YOUR_API_KEY
```

**Header Requirements:**

-   **Header Name**: `Authorization`
-   **Token Type**: `Bearer`
-   **Value**: Your assigned API key

**Example:**

```
Authorization: Bearer gami_ak_1234567890abcdef
```

Requests without proper authorization will return a `401 Unauthorized` response.

## [](#tag/Workspaces)Workspaces

Workspaces serve as the top-level containers for all resources in the system. Each workspace acts as an isolated namespace that contains models and jobs, providing clear separation between different projects or use cases.

**Authentication & Access:**

-   API keys are workspace-scoped and provide access to a single workspace
-   All API operations are performed within the context of the authenticated workspace
-   Cross-workspace access is not permitted

**Resource Organization:**

-   Models are created within workspaces and define data extraction schemas
-   Extractions execute within workspaces using workspace-owned models
-   All resources inherit the workspace's access permissions

**API Operations:**

-   `GET /api/v1/workspaces` - List accessible workspaces (returns single workspace for current API key)
-   `GET /api/v1/workspaces/{id}` - Retrieve workspace details

**Current Limitations:** At present, each API key can only access a single workspace. Future versions may support multi-workspace access patterns.

## [](#tag/Workspaces/operation/ \(12\))List workspaces

List all workspaces accessible to the API key. At present, an API key can access a single workspace. Results are paginated using cursor-based pagination with workspaces sorted by ID in descending order (newest first).

##### Authorizations:

_authorization_

##### query Parameters

cursor

integer

Example: cursor=123

Cursor for pagination (job ID to start after)

limit

integer

Example: limit=20

Maximum number of jobs to return

### Responses

**200**

Workspaces

get/api/v1/workspaces

https://gamilab.ch/api/v1/workspaces

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "cursor": 0,      -   "data": [          -   {                  -   "id": 1,                      -   "name": "My Workspace"                               }                   ],      -   "limit": 1,      -   "next_cursor": 0       }`

## [](#tag/Workspaces/operation/ \(13\))Show workspace

Show a workspace by ID accessible to the API key.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Workspace ID

### Responses

**200**

Workspace

get/api/v1/workspaces/{id}

https://gamilab.ch/api/v1/workspaces/{id}

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "id": 1,              -   "name": "My Workspace"                   }       }`

## [](#tag/Models)Models

Models define the structured data schemas used by extraction extractions to transform unstructured text into consistent, validated JSON output. They serve as the blueprint that governs how raw input data gets converted into structured records within workspaces.

**Workspace Integration:**

-   Models belong to specific workspaces and are scoped to workspace access
-   Models can only be used by extractions within the same workspace
-   All model operations require workspace-level authorization

**Schema Structure:**

-   **Hierarchical Fields**: Nested object structures with typed field definitions
-   **Field Types**: Support for strings, numbers, booleans, arrays, and nested objects
-   **Field Metadata**: Names, descriptions, and prompts guide data extraction
-   **Validation Rules**: Type constraints ensure output data consistency

**Model Lifecycle:**

-   **Creation**: Models are created within workspaces with defined schemas
-   **Usage**: Extractions reference models for data extraction processing
-   **Protection**: Models with running extractions cannot be deleted
-   **Persistence**: Models remain available for reuse across multiple extractions

**API Operations:**

-   `GET /api/v1/workspaces/{workspace_id}/models` - List models in workspace (paginated, schema excluded)
-   `POST /api/v1/workspaces/{workspace_id}/models` - Create new model with schema
-   `GET /api/v1/models/{id}` - Retrieve model with complete schema definition
-   `PUT /api/v1/models/{id}` - Update model schema and metadata
-   `DELETE /api/v1/models/{id}` - Delete model (blocked if running extractions exist)

**Data Management:**

-   Collection responses exclude schema fields for performance
-   Individual model responses include complete schema definitions
-   Models cannot be deleted while extractions are actively using them

**Processing Integration:**

-   Extraction extractions require a model\_id to define output structure
-   Processing system uses model schemas to validate and structure extraction outputs
-   Model schemas guide the AI processing to extract relevant information

**Schema Flexibility:**

-   Support for complex nested structures and arrays
-   Descriptive field prompts help guide extraction accuracy
-   Reusable across multiple extractions with similar data extraction needs

## [](#tag/Models/operation/ \(3\))Delete model

Delete a model. Models with running jobs cannot be deleted.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Model ID

### Responses

**204**

Empty response

**400**

Bad Request

delete/api/v1/models/{id}

https://gamilab.ch/api/v1/models/{id}

### Response samples

-   400

Content type

application/json

Copy

`{  -   "error": "string"       }`

## [](#tag/Models/operation/ModelController.show)Show model

Show a model by ID with the full schema.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Model ID

### Responses

**200**

Model

get/api/v1/models/{id}

https://gamilab.ch/api/v1/models/{id}

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Extract person information from text",              -   "id": 1,              -   "name": "Person model",              -   "output_language": "en",              -   "prompt": "Extract person data from the following text...",              -   "schema": {                  -   "fields": [                          -   {                                  -   "name": "first_name",                                      -   "type": "string"                                                       },                              -   {                                  -   "name": "last_name",                                      -   "type": "string"                                                       }                                           ],                      -   "name": "person",                      -   "type": "object"                               }                   }       }`

## [](#tag/Models/operation/ \(4\))Update model

Updating a model that has jobs will NOT rerun them. If you modify the schema the existing job outputs will follow an outdated schema structure.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Model ID

##### Request Body schema: application/json

required

The model attributes

model

required

Model (object)

### Responses

**200**

Model

patch/api/v1/models/{id}

https://gamilab.ch/api/v1/models/{id}

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "model": {          -   "description": "Extract person information from text",              -   "name": "Person model",              -   "output_language": "en",              -   "prompt": "Extract person data from the following text...",              -   "schema": {                  -   "fields": [                          -   {                                  -   "name": "first_name",                                      -   "type": "string"                                                       },                              -   {                                  -   "name": "last_name",                                      -   "type": "string"                                                       }                                           ],                      -   "name": "person",                      -   "type": "object"                               }                   }       }`

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Extract person information from text",              -   "id": 1,              -   "name": "Person model",              -   "output_language": "en",              -   "prompt": "Extract person data from the following text...",              -   "schema": {                  -   "fields": [                          -   {                                  -   "name": "first_name",                                      -   "type": "string"                                                       },                              -   {                                  -   "name": "last_name",                                      -   "type": "string"                                                       }                                           ],                      -   "name": "person",                      -   "type": "object"                               }                   }       }`

## [](#tag/Models/operation/ \(2\))Update model

Updating a model that has jobs will NOT rerun them. If you modify the schema the existing job outputs will follow an outdated schema structure.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Model ID

##### Request Body schema: application/json

required

The model attributes

model

required

Model (object)

### Responses

**200**

Model

put/api/v1/models/{id}

https://gamilab.ch/api/v1/models/{id}

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "model": {          -   "description": "Extract person information from text",              -   "name": "Person model",              -   "output_language": "en",              -   "prompt": "Extract person data from the following text...",              -   "schema": {                  -   "fields": [                          -   {                                  -   "name": "first_name",                                      -   "type": "string"                                                       },                              -   {                                  -   "name": "last_name",                                      -   "type": "string"                                                       }                                           ],                      -   "name": "person",                      -   "type": "object"                               }                   }       }`

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Extract person information from text",              -   "id": 1,              -   "name": "Person model",              -   "output_language": "en",              -   "prompt": "Extract person data from the following text...",              -   "schema": {                  -   "fields": [                          -   {                                  -   "name": "first_name",                                      -   "type": "string"                                                       },                              -   {                                  -   "name": "last_name",                                      -   "type": "string"                                                       }                                           ],                      -   "name": "person",                      -   "type": "object"                               }                   }       }`

## [](#tag/Models/operation/ \(16\))List models in workspace

Models are scoped to workspaces as child objects. Results are paginated using cursor-based pagination with models sorted by ID in descending order (newest first).

##### Authorizations:

_authorization_

##### path Parameters

workspace\_id

required

integer

Example: 1

Workspace ID

##### query Parameters

cursor

integer

Example: cursor=123

Cursor for pagination (job ID to start after)

limit

integer

Example: limit=20

Maximum number of jobs to return

### Responses

**200**

Model

get/api/v1/workspaces/{workspace\_id}/models

https://gamilab.ch/api/v1/workspaces/{workspace\_id}/models

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "cursor": 0,      -   "data": [          -   {                  -   "description": "Extract person information from text",                      -   "id": 1,                      -   "name": "Person model",                      -   "output_language": "en",                      -   "prompt": "Extract person data from the following text...",                      -   "schema": {                          -   "fields": [                                  -   {                                          -   "name": "first_name",                                              -   "type": "string"                                                                   },                                      -   {                                          -   "name": "last_name",                                              -   "type": "string"                                                                   }                                                       ],                              -   "name": "person",                              -   "type": "object"                                           }                               }                   ],      -   "limit": 1,      -   "next_cursor": 0       }`

## [](#tag/Models/operation/ \(17\))Create model

Create a model to specify the schema structure.

##### Authorizations:

_authorization_

##### path Parameters

workspace\_id

required

integer

Example: 1

Workspace ID

##### Request Body schema: application/json

required

The model attributes

model

required

Model (object)

### Responses

**201**

Model

post/api/v1/workspaces/{workspace\_id}/models

https://gamilab.ch/api/v1/workspaces/{workspace\_id}/models

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "model": {          -   "description": "Extract person information from text",              -   "name": "Person model",              -   "output_language": "en",              -   "prompt": "Extract person data from the following text...",              -   "schema": {                  -   "fields": [                          -   {                                  -   "name": "first_name",                                      -   "type": "string"                                                       },                              -   {                                  -   "name": "last_name",                                      -   "type": "string"                                                       }                                           ],                      -   "name": "person",                      -   "type": "object"                               }                   }       }`

### Response samples

-   201

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Extract person information from text",              -   "id": 1,              -   "name": "Person model",              -   "output_language": "en",              -   "prompt": "Extract person data from the following text...",              -   "schema": {                  -   "fields": [                          -   {                                  -   "name": "first_name",                                      -   "type": "string"                                                       },                              -   {                                  -   "name": "last_name",                                      -   "type": "string"                                                       }                                           ],                      -   "name": "person",                      -   "type": "object"                               }                   }       }`

## [](#tag/Extractions)Extractions

Extractions are the primary processing units that transform input data according to model schemas within workspaces. They encapsulate the complete data transformation workflow from input through processing to structured output results.

**Workspace Integration:**

-   Extractions belong to specific workspaces and use workspace-owned models
    
-   All extraction operations are scoped to the authenticated workspace
    
-   Extractions cannot access models or resources from other workspaces
    
-   **Extraction Extractions**: Transform unstructured input text into structured data using model schemas
    

**Processing Lifecycle:**

-   **Pending**: Extraction is queued and awaiting processing
-   **Running**: Extraction is actively being processed (cannot be modified or deleted)
-   **Completed**: Extraction finished successfully with structured output
-   **Failed**: Extraction encountered an error during processing

**Input/Output:**

-   **Input**: Raw text data provided when creating the extraction
-   **Output**: Structured JSON data conforming to the associated model schema
-   **Metadata**: Processing timestamps, status messages, and review URLs

**API Operations:**

-   `GET /api/v1/workspaces/{workspace_id}/extractions` - List extractions in workspace (paginated)
-   `POST /api/v1/workspaces/{workspace_id}/extractions` - Create new extraction
-   `GET /api/v1/extractions/{id}` - Retrieve extraction with full details including input/output
-   `PUT /api/v1/extractions/{id}` - Update extraction (only when status is pending)
-   `DELETE /api/v1/extractions/{id}` - Delete extraction (only when status is pending)

**Processing Constraints:**

-   Running extractions cannot be updated or deleted
-   Only pending extractions can be modified
-   Extraction processing is handled by the background processing system

**Data Management:**

-   Collection responses exclude input/output fields for performance
-   Individual extraction responses include complete data and processing metadata
-   Review URLs provide access to extraction results via web interface

## [](#tag/Extractions/paths/~1api~1v1~1extractions~1{id}/delete)Delete extraction

Delete a extraction and all associated data. Running extractions cannot be deleted.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Extraction ID

### Responses

**204**

Empty response

**400**

Bad Request

delete/api/v1/extractions/{id}

https://gamilab.ch/api/v1/extractions/{id}

### Response samples

-   400

Content type

application/json

Copy

`{  -   "error": "string"       }`

## [](#tag/Extractions/operation/ExtractionController.show)Show extraction

Show a extraction by ID with its input data, output results, and processing status.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Extraction ID

### Responses

**200**

Extraction

get/api/v1/extractions/{id}

https://gamilab.ch/api/v1/extractions/{id}

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "id": 1,              -   "input": "Extract customer info from: John Doe, order #12345...",              -   "inserted_at": "2023-06-15T10:29:45Z",              -   "output": {                  -   "customer_name": "John Doe",                      -   "order_number": "12345"                               },              -   "status": "succeeded",              -   "type": "extraction",              -   "updated_at": "2023-06-15T10:30:15Z"                   }       }`

## [](#tag/Extractions/operation/ \(14\))List extractions in workspace

Extractions are scoped to workspaces through their associated models. Results are paginated using cursor-based pagination with extractions sorted by ID in descending order (newest first).

##### Authorizations:

_authorization_

##### path Parameters

workspace\_id

required

integer

Example: 1

Workspace ID

##### query Parameters

cursor

integer

Example: cursor=123

Cursor for pagination (job ID to start after)

limit

integer

Example: limit=20

Maximum number of jobs to return

### Responses

**200**

Extractions

get/api/v1/workspaces/{workspace\_id}/extractions

https://gamilab.ch/api/v1/workspaces/{workspace\_id}/extractions

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "cursor": 0,      -   "data": [          -   {                  -   "id": 1,                      -   "input": "Extract customer info from: John Doe, order #12345...",                      -   "inserted_at": "2023-06-15T10:29:45Z",                      -   "output": {                          -   "customer_name": "John Doe",                              -   "order_number": "12345"                                           },                      -   "status": "succeeded",                      -   "type": "extraction",                      -   "updated_at": "2023-06-15T10:30:15Z"                               }                   ],      -   "limit": 1,      -   "next_cursor": 0       }`

## [](#tag/Extractions/operation/ \(15\))Create extraction

Create a extraction to process input data according to the model schema. The extraction will be queued for processing.

##### Authorizations:

_authorization_

##### path Parameters

model\_id

required

integer

Example: 1

Model ID

##### Request Body schema: application/json

required

The extraction attributes

extraction

required

Extraction (object)

### Responses

**201**

Extraction

post/api/v1/workspaces/{workspace\_id}/extractions

https://gamilab.ch/api/v1/workspaces/{workspace\_id}/extractions

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "extraction": {          -   "id": 1,              -   "input": "Extract customer info from: John Doe, order #12345...",              -   "inserted_at": "2023-06-15T10:29:45Z",              -   "output": {                  -   "customer_name": "John Doe",                      -   "order_number": "12345"                               },              -   "status": "succeeded",              -   "type": "extraction",              -   "updated_at": "2023-06-15T10:30:15Z"                   }       }`

### Response samples

-   201

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "id": 1,              -   "input": "Extract customer info from: John Doe, order #12345...",              -   "inserted_at": "2023-06-15T10:29:45Z",              -   "output": {                  -   "customer_name": "John Doe",                      -   "order_number": "12345"                               },              -   "status": "succeeded",              -   "type": "extraction",              -   "updated_at": "2023-06-15T10:30:15Z"                   }       }`

## [](#tag/Portals)Portals

Portals provide interactive interfaces for models, allowing users to collect data through threads. Each portal is associated with a model and enables real-time data collection and processing.

**Model Integration:**

-   Portals are created for specific models
-   Each portal inherits the model's schema and processing capabilities
-   Multiple portals can be created for the same model

**Thread Management:**

-   Threads are created within portals to capture user interactions
-   Each thread contains events (audio, text, struct) that represent collected data
-   Threads can be resolved to produce structured output based on struct events

**API Operations:**

-   `GET /api/v1/workspaces/{workspace_id}/portals` - List portals in workspace (paginated)
-   `POST /api/v1/workspaces/{workspace_id}/portals` - Create new portal
-   `GET /api/v1/portals/{id}` - Retrieve portal details
-   `PUT /api/v1/portals/{id}` - Update portal configuration
-   `DELETE /api/v1/portals/{id}` - Delete portal and associated threads

**Access Control:**

-   Portals are workspace-scoped and inherit workspace permissions
-   Portal access requires valid workspace authentication

## [](#tag/Portals/operation/ \(6\))Delete portal

Delete a portal. Portals with associated threads cannot be deleted.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Portal ID

### Responses

**204**

Empty response

**400**

Bad Request - Portal has threads

delete/api/v1/portals/{id}

https://gamilab.ch/api/v1/portals/{id}

### Response samples

-   400

Content type

application/json

Copy

`{  -   "error": "string"       }`

## [](#tag/Portals/operation/PortalController.show)Show portal

Show a portal by ID.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Portal ID

### Responses

**200**

Portal

get/api/v1/portals/{id}

https://gamilab.ch/api/v1/portals/{id}

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Portal for customer support interactions",              -   "id": 1,              -   "inserted_at": "2025-01-01T00:00:00Z",              -   "language": "en",              -   "model_id": 1,              -   "name": "Customer Support Portal",              -   "updated_at": "2025-01-01T00:00:00Z",              -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)",              -   "workspace_id": 1                   }       }`

## [](#tag/Portals/operation/ \(7\))Update portal

Update a portal's attributes. When updating model\_id, the new model must belong to the same workspace.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Portal ID

##### Request Body schema: application/json

required

The portal attributes

portal

required

Portal (object)

### Responses

**200**

Portal

**403**

Forbidden - Model does not belong to workspace

patch/api/v1/portals/{id}

https://gamilab.ch/api/v1/portals/{id}

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "portal": {          -   "description": "Portal for customer support interactions",              -   "language": "en",              -   "model_id": 1,              -   "name": "Customer Support Portal",              -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)"                   }       }`

### Response samples

-   200
-   403

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Portal for customer support interactions",              -   "id": 1,              -   "inserted_at": "2025-01-01T00:00:00Z",              -   "language": "en",              -   "model_id": 1,              -   "name": "Customer Support Portal",              -   "updated_at": "2025-01-01T00:00:00Z",              -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)",              -   "workspace_id": 1                   }       }`

## [](#tag/Portals/operation/ \(5\))Update portal

Update a portal's attributes. When updating model\_id, the new model must belong to the same workspace.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Portal ID

##### Request Body schema: application/json

required

The portal attributes

portal

required

Portal (object)

### Responses

**200**

Portal

**403**

Forbidden - Model does not belong to workspace

put/api/v1/portals/{id}

https://gamilab.ch/api/v1/portals/{id}

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "portal": {          -   "description": "Portal for customer support interactions",              -   "language": "en",              -   "model_id": 1,              -   "name": "Customer Support Portal",              -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)"                   }       }`

### Response samples

-   200
-   403

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Portal for customer support interactions",              -   "id": 1,              -   "inserted_at": "2025-01-01T00:00:00Z",              -   "language": "en",              -   "model_id": 1,              -   "name": "Customer Support Portal",              -   "updated_at": "2025-01-01T00:00:00Z",              -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)",              -   "workspace_id": 1                   }       }`

## [](#tag/Portals/operation/ \(18\))List portals in workspace

Portals are scoped to workspaces as child objects. Results are paginated using cursor-based pagination with portals sorted by ID in descending order (newest first).

##### Authorizations:

_authorization_

##### path Parameters

workspace\_id

required

integer

Example: 1

Workspace ID

##### query Parameters

cursor

integer

Example: cursor=123

Cursor for pagination (job ID to start after)

limit

integer

Example: limit=20

Maximum number of jobs to return

### Responses

**200**

Portals

get/api/v1/workspaces/{workspace\_id}/portals

https://gamilab.ch/api/v1/workspaces/{workspace\_id}/portals

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "cursor": 0,      -   "data": [          -   {                  -   "description": "Portal for customer support interactions",                      -   "id": 1,                      -   "inserted_at": "2025-01-01T00:00:00Z",                      -   "language": "en",                      -   "model_id": 1,                      -   "name": "Customer Support Portal",                      -   "updated_at": "2025-01-01T00:00:00Z",                      -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)",                      -   "workspace_id": 1                               }                   ],      -   "limit": 1,      -   "next_cursor": 0       }`

## [](#tag/Portals/operation/ \(19\))Create portal

Create a portal associated with a model. The model must belong to the same workspace.

##### Authorizations:

_authorization_

##### path Parameters

workspace\_id

required

integer

Example: 1

Workspace ID

##### Request Body schema: application/json

required

The portal attributes

portal

required

Portal (object)

### Responses

**201**

Portal

**403**

Forbidden - Model does not belong to workspace

post/api/v1/workspaces/{workspace\_id}/portals

https://gamilab.ch/api/v1/workspaces/{workspace\_id}/portals

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "portal": {          -   "description": "Portal for customer support interactions",              -   "language": "en",              -   "model_id": 1,              -   "name": "Customer Support Portal",              -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)"                   }       }`

### Response samples

-   201
-   403

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "description": "Portal for customer support interactions",              -   "id": 1,              -   "inserted_at": "2025-01-01T00:00:00Z",              -   "language": "en",              -   "model_id": 1,              -   "name": "Customer Support Portal",              -   "updated_at": "2025-01-01T00:00:00Z",              -   "webhook_url": "[https://example.com/webhook](https://example.com/webhook)",              -   "workspace_id": 1                   }       }`

## [](#tag/Threads)Threads

Threads capture sequences of events within portals, representing user interactions and data collection sessions. Each thread maintains a timeline of events that can be resolved into structured data.

**Portal Integration:**

-   Threads belong to specific portals
-   All thread operations are scoped to the parent portal's workspace
-   Threads inherit access controls from their workspace

**Event Types:**

-   **Audio Events**: Audio data with format, waveform, and duration metadata
-   **Text Events**: Textual data with timing information
-   **Struct Events**: Structured data operations (set, insert, delete) for building final output

**Event Resolution:**

-   Struct events are applied in chronological order to build the final data structure
-   The resolved output can be any JSON type (object, array, primitive)
-   Events use priority-based ordering for conflict resolution

**API Operations:**

-   `GET /api/v1/portals/{portal_id}/threads` - List threads for portal (paginated)
-   `POST /api/v1/portals/{portal_id}/threads` - Create new thread
-   `GET /api/v1/threads/{id}` - Retrieve thread metadata
-   `DELETE /api/v1/threads/{id}` - Delete thread and all events
-   `GET /api/v1/threads/{thread_id}/events` - List events for thread (paginated)
-   `GET /api/v1/threads/{id}/resolve` - Get resolved struct data from thread events

**Data Structure:**

-   Threads track duration in milliseconds
-   Events are ordered by offset (timestamp within thread)
-   Resolved output structure is determined by struct events

**Performance:**

-   Event listings exclude audio data for efficiency
-   Individual events can be retrieved with full audio data when needed
-   Resolution is computed on-demand from struct events

## [](#tag/Threads/operation/ \(8\))List threads for portal

Threads are scoped to portals. Results are paginated using cursor-based pagination with threads sorted by ID in descending order (newest first).

##### Authorizations:

_authorization_

##### path Parameters

portal\_id

required

integer

Example: 1

Portal ID

##### query Parameters

cursor

integer

Example: cursor=123

Cursor for pagination (job ID to start after)

limit

integer

Example: limit=20

Maximum number of jobs to return

### Responses

**200**

Threads

get/api/v1/portals/{portal\_id}/threads

https://gamilab.ch/api/v1/portals/{portal\_id}/threads

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "cursor": 0,      -   "data": [          -   {                  -   "duration": 5000,                      -   "id": 1,                      -   "inserted_at": "2025-01-01T00:00:00Z",                      -   "portal_id": 1,                      -   "updated_at": "2025-01-01T00:00:00Z",                      -   "workspace_id": 1                               }                   ],      -   "limit": 1,      -   "next_cursor": 0       }`

## [](#tag/Threads/operation/ \(9\))Create thread

Create a thread for a portal.

##### Authorizations:

_authorization_

##### path Parameters

portal\_id

required

integer

Example: 1

Portal ID

##### Request Body schema: application/json

required

The thread attributes

thread

object

### Responses

**201**

Thread

post/api/v1/portals/{portal\_id}/threads

https://gamilab.ch/api/v1/portals/{portal\_id}/threads

### Request samples

-   Payload

Content type

application/json

Copy

Expand all Collapse all

`{  -   "thread": {          -   "duration": 0                   }       }`

### Response samples

-   201

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "duration": 5000,              -   "id": 1,              -   "inserted_at": "2025-01-01T00:00:00Z",              -   "portal_id": 1,              -   "updated_at": "2025-01-01T00:00:00Z",              -   "workspace_id": 1                   }       }`

## [](#tag/Threads/operation/ \(10\))Delete thread

Delete a thread.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Thread ID

### Responses

**204**

Empty response

delete/api/v1/threads/{id}

https://gamilab.ch/api/v1/threads/{id}

## [](#tag/Threads/operation/ThreadController.show)Show thread

Show a thread by ID (without event data).

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Thread ID

### Responses

**200**

Thread

get/api/v1/threads/{id}

https://gamilab.ch/api/v1/threads/{id}

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "data": {          -   "duration": 5000,              -   "id": 1,              -   "inserted_at": "2025-01-01T00:00:00Z",              -   "portal_id": 1,              -   "updated_at": "2025-01-01T00:00:00Z",              -   "workspace_id": 1                   }       }`

## [](#tag/Threads/operation/ThreadController.resolve)Get resolved thread struct

Returns the resolved struct data for a thread by applying all struct events in chronological order. The response is freeform JSON whose structure depends on the events.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Thread ID

### Responses

**200**

Resolved struct

get/api/v1/threads/{id}/resolve

https://gamilab.ch/api/v1/threads/{id}/resolve

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "items": [          -   "Item 1",              -   "Item 2"                   ],      -   "title": "Example Thread"       }`

## [](#tag/Threads/operation/ThreadController.transcript)Get full transcript

Returns the full transcript text for a thread by concatenating all text events in chronological order.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Thread ID

### Responses

**200**

Transcript text

get/api/v1/threads/{id}/transcript

https://gamilab.ch/api/v1/threads/{id}/transcript

## [](#tag/Threads/operation/ \(11\))List events for thread

List all events for a thread. Results are paginated using cursor-based pagination with events sorted by ID in descending order (newest first). Audio data is excluded from events.

##### Authorizations:

_authorization_

##### path Parameters

id

required

integer

Example: 1

Thread ID

##### query Parameters

cursor

integer

Example: cursor=123

Cursor for pagination (job ID to start after)

limit

integer

Example: limit=20

Maximum number of jobs to return

### Responses

**200**

Events

get/api/v1/threads/{thread\_id}/events

https://gamilab.ch/api/v1/threads/{thread\_id}/events

### Response samples

-   200

Content type

application/json

Copy

Expand all Collapse all

`{  -   "cursor": 0,      -   "data": [          -   {                  -   "at": "2025-01-01T00:00:00Z",                      -   "duration": 500,                      -   "id": 1,                      -   "inserted_at": "2025-01-01T00:00:00Z",                      -   "offset": 1000,                      -   "text_data": "Hello world",                      -   "thread_id": 1,                      -   "type": "text",                      -   "updated_at": "2025-01-01T00:00:00Z"                               }                   ],      -   "limit": 1,      -   "next_cursor": 0       }`

<iframe id="flylighter-iframe" title="Flylighter" allow="clipboard-write; display-capture;" allowtransparency="true" style="
			top: 16px;
			right:16px;
			position: fixed; 
			z-index: 2147483647;
			opacity: 0;
			offset-anchor: top right;
			outline: none;
			overflow: hidden;
			pointer-events: none;
			box-sizing: border-box;
			margin: 0 !important;
			border: none;
            width: 401px;
            background: transparent;
            max-height: unset !important;
            min-width: 401px;
			color-scheme: auto;
			border-radius: 12px;
			min-width: unset !important;
		" src="chrome-extension://dlmdffmkcggiicjbfnjcnikkpahgplmd/src/pages/listener/listener.html"></iframe>

![](chrome-extension://kobncfkmjelbefaoohoblamnbackjggk/icon/icon_32.png)

×

<iframe name="glasp-tooltip-iframe" id="glasp-tooltip-iframe" style="display: none;"></iframe><iframe name="glasp-sidebar-iframe" id="glasp-sidebar-iframe" style="display: none !important;width: 0px !important; min-width: 0px !important; max-width: 320px; height: 100%; background: transparent; margin: auto; position: fixed; top: 0px; right: 0px; left: auto; z-index: 9000000000000000000;border: none !important;"></iframe>

## Embedded Content

---

[](https://glasp.co?ref=glasp-extension)

Join 1 million+ curious minds shaping the future of knowledge sharing

-   Highlight Web & PDF
-   Summarize YouTube & PDF
-   Export Kindle Highlights
-   Transcribe Audio & Video
-   Chat with Your Highlights

Log in Sign up

Click sign in or sign up to agree to our [Terms of Service](https://glasp.co/terms-of-service) and [Privacy Policy](https://glasp.co/privacy-policy)