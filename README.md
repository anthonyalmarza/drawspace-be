### Running Tests
`yarn install`

`yarn test` (must have docker installed)

### General architecture
- AWS CDK for infrastructure as code
- Cognito for user auth
- Dynamodb as the database
- Api-gateway / lambdas 
- S3 for browser based image/drawStack uploads
- `lambda-api` library for API routing
- `dynamodb-toolbox` as a Dynamodb "ORM"

### Reasoning
I like CDK because you can version your infrastructure, plus it helps with deployment via CloudFormation.  I'm generally a serverless advocate, and like to let AWS handle scaling so I chose to use Api-gateway/lambda and DynamoDb. Dynamodb is infinitely scalable, performant and cheap.  I Like to use Ddb for data at rest and denormalize to other specialized databases for things like search (elasticsearch). Cognito allows for authenticating browser based uploads to s3 so only logged in users can upload to their bucket.


### Didn't Implement / Trade offs
- I probably would have split these stacks into their own repos in a prod environment
- Not as many developer are comfortable with Dynamodb
- Security concern with s3 uploads: I could post any api to the rest api for my thumbnail. Could easily be fixed by validating it is in the users bucket
- Can't run the api locally, didn't have enough time to set up a dockerized ddb for it


### Ddb Access patterns

```
Create User
Get User / Bulk Get User: 1

List Public Drawings: 3
List Users Drawings: 4
Get Drawing: 2
Create Public Drawing
Create Private Drawing
Delete Drawing

### Entities
  Entity       PK                                   SK
1 user         user#<userId>                        user#<userId>
2 drawing      drawing#<drawingId>                  drawing#<drawingId>

### GSI1
  Entity       GSI1PK                               GSI1SK
3 drawing      gsi1pkDrawing#<truncatedTimestamp>   gsi1skDrawing#<public/private>#<publishDate>

### GSI2
  Entity       GSI2PK                               GSI2SK
4 drawing      gsi2pkDrawing#<userId>               gsi2skDrawing#<createDate>
```