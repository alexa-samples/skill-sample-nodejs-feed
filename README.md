# Sample Skill Feed

This sample skill provides an easy way to create Alexa skills that reads content from a RSS/Atom feed.

## How to Get Started

To get get started with the feed skill, you'll need to setup a few pre-requisites:


* The Node.js code will be deployed to AWS Lambda to handle requests from users passed to you from the Alexa platform.
* The skill uses a table in AWS DynamoDB to save the user's favorites and latest heard items between sessions.
* The skill used a bucket in AWS S3 to store the feed requested by the user.
* You can then register your skill with Alexa using the Amazon Developer website, linking it to your AWS resources.

Set these up with these step-by-step instructions:

1. Create or login to an AWS account. In the AWS Console:
  1. Create an AWS Role in IAM with access to DynamoDB, S3 and CloudWatch logs.

     ![create_role_1](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-1.PNG "AWS Create Role Screenshot 1")
     ![create_role_2](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-2.PNG "AWS Create Role Screenshot 2")
     ![create_role_3](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-3.PNG "AWS Create Role Screenshot 3")

  1. Create an AWS Lambda function named MyFeedSkillLambdaFunction.
    1. Under "Select blueprint", choose skip.
    1. Under "Configure triggers", select "Alexa Skills Kit" as the trigger.
  
     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17451088/ff126618-5b18-11e6-8f46-fbfb9461ab80.png "AWS Lambda Create Trigger Screenshot")
     
    1. Under "Configure function", enter the skill name as MyFeedSkillLambdaFunction.  Leave the defaults for everything except choose the role you created above under "Existing role".   Take note of the ARN on the upper right, which you'll configure in the Developer Console later.

  1. Create an AWS S3 Bucket with the name of your choice. Note, S3 bucket name you choose must be unique across all existing bucket names in Amazon S3. Thus you may have to retry with another name in case of a conflict.

       ![alt text](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-s3-bucket-screenshot-1.PNG "AWS DynamoDB Screenshot")

  1. **[OPTIONAL]** Create an AWS DynamoDB table named MyFeedSkillTable with the case sensitive primary key "userId".

     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17307587/b80787f2-57ea-11e6-9be2-3df26e8e5947.png "AWS DynamoDB Screenshot")

1. Create or login to an [Amazon Developer account](https://developer.amazon.com).  In the Developer Console:
  1. [Create an Alexa Skill](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function) named MySkill and using the invocation name "my skill" and using the ARN you noted above.

     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17307653/13500166-57eb-11e6-844d-1083efa3dddb.png "Developer Portal Skill Information Screenshot")

     Note the Skill Application Id.

     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17307655/167433a8-57eb-11e6-9951-822ad2243f11.png "Developer Portal Configuration Screenshot")



## Set up Your Machine

Next, you'll setup your local environment to run the deployment script.

1. Configure AWS credentials the tool will use to upload code to your Skill.  You do this by creating a file under a ".aws" directory in your home directory.

2. The file should have the format, and include keys you retrieve from the AWS console:

    ```
    [default]
    aws_access_key_id = [KEY FROM AWS]
    aws_secret_access_key = [SECRET KEY FROM AWS]
    ```

3.	Setup [NodeJS and NPM](https://nodejs.org/en/download/).

4.	Get the code and install dependencies:

    ```
    git clone  https://github.com/alexa/skill-sample-nodejs-feed.git
    cd skill-sample-nodejs-feed/src
    npm install
    ```

## Configure your feed

1. Open ```/src/configurations.js``` file.

2. Insert following information to configure the skill :

    * appId : Your Skill Application ID.
    * welcome_message : A Welcome Message, for example "Welcome to Feed Skill"
    * number_feeds_per_prompt : Number of Items read together. Recommended number is 3.
    * display_only_feed_title : Boolean Flag to decide whether to speak out title only or title with summary.
    * display_only_title_in_card : Boolean Flag to decide whether to display a card title only or title with summary.
    * categories : Comma separated feed-name feed-url values.
    * speech_style_for_numbering_feeds : Naming convention for each item.
    * s3BucketName : Your S3 Bucket Name
    * dynamoDBTableName : Your DynamoDB Table Name (If not created, the skill will create it.)


3. A sample configuration :

    ```javascript
    var config = {
        appId : 'amzn1.ask.skill.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        welcome_message : 'Welcome to Feed Skill',
        number_feeds_per_prompt : 3,
        display_only_feed_title : true,
        display_only_title_in_card : true,
        categories : {
            'feed name' : 'http://www.rss-feed.xml'
        },
        speech_style_for_numbering_feeds : 'Item',
        s3BucketName : 'my-feed-skill-bucket',
        dynamoDBTableName : 'MyFeedSkillBucket'
    };
    ```

## Deploy Skill

1. Go to ```./bin/``` directory and run deploy.js script with Node command.
    ```
    node deploy.js
    ```
2. Go to the the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.

3. Select Code entry type as "Upload a .ZIP file" and then upload the .zip file to the Lambda.

4. Go back to your Alexa Skill on [Amazon Developer account](https://developer.amazon.com/edw/home.html#/skills/list) copy following content from ```./speechAssets/``` to the Interaction Model :
    * IntentSchema.json to **Intent Schema**
    * Utterances.txt to **Sample Utterances**
    * CustomSlots-ORDINALS.txt to a new custom slot with Type : ORDINAL
    * **[If there are multiple feeds]** CustomSlots-CATEGORIES.txt to a new custom slot with Type : CATEGORY

5. You can start testing the skill on your device or on the simulator now, but you can go ahead and fill in the Publishing Information and accept the Privacy & Compliance information to submit the skill for certification. By creating an Alexa skill based on the Feed skill template, you acknowledge ownership of any RSS/ATOM feed(s) used within the skill, and/or have permission to use the RSS/ATOM feed(s) from the original content owner. Failure to be able to prove ownership or permission to use any feed sources, at any time, will likely cause your skill to be rejected during the certification process, or being removed from the Alexa Skill Store without notice at a later date.
