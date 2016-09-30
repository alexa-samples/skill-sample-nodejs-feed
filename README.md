# RSS/Atom Feed Sample Project

This sample skill provides an easy way to create Alexa skills that reads headlines from an RSS/Atom feed.

## How to Run the Sample

To get started, you'll need to setup a few pre-requisites:

* The Node.js code will be deployed to AWS Lambda to handle requests from users passed to you from the Alexa platform.
* The skill uses a table in AWS DynamoDB to save the user's favorites and latest heard items between sessions.
* The skill uses a bucket in AWS S3 to cache the feed requested by the user.
* You can then register your skill with Alexa using the Amazon Developer website, linking it to your AWS resources.

Set these up with these step-by-step instructions:

1. Create or login to an AWS account. In the AWS Console:
  1. Be sure to select "N. Virginia" as the region on the upper right.  
  1. Create an AWS Role in IAM with access to DynamoDB, S3 and CloudWatch logs.

     ![create_role_1](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-1.PNG "AWS Create Role Screenshot 1")
     ![create_role_2](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-2.PNG "AWS Create Role Screenshot 2")
     ![create_role_3](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-3.PNG "AWS Create Role Screenshot 3")

  1. Create an AWS Lambda function named MyFeedSkillLambdaFunction.
    1. Under "Select blueprint", choose skip.
    1. Under "Configure triggers", select "Alexa Skills Kit" as the trigger.
  
     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17451088/ff126618-5b18-11e6-8f46-fbfb9461ab80.png "AWS Lambda Create Trigger Screenshot")
     
    1. Under "Configure function":
      1. Enter "MyFeedSkillLambdaFunction" under "Name".  
      1. Choose the role you created above under "Existing role".
      1. Change the "Timeout" to 30 seconds, since feeds can become an issue.
      1. Leave the defaults for everything else.
    1. Note the ARN of the Lambda you've created, which you'll need later.

  1. Create an AWS S3 Bucket with the name of your choice. Note, the S3 bucket name you choose must be unique across all existing bucket names in Amazon S3. Thus you may have to retry with another name in case of a conflict.

       ![alt text](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-s3-bucket-screenshot-1.PNG "AWS DynamoDB Screenshot")

  1. **[OPTIONAL]** Create an AWS DynamoDB table named MyFeedSkillTable with the case sensitive primary key "userId".

     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17307587/b80787f2-57ea-11e6-9be2-3df26e8e5947.png "AWS DynamoDB Screenshot")

1. Create or login to an [Amazon Developer account](https://developer.amazon.com).  In the Developer Console:
  1. [Create an Alexa Skill](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/developing-an-alexa-skill-as-a-lambda-function) named MySkill and using the invocation name "my skill" and using the ARN you noted above.

     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17307653/13500166-57eb-11e6-844d-1083efa3dddb.png "Developer Portal Skill Information Screenshot")

     Note the Skill Application Id, which you'll configure in your code later.

     ![alt text](https://cloud.githubusercontent.com/assets/7671574/17307655/167433a8-57eb-11e6-9951-822ad2243f11.png "Developer Portal Configuration Screenshot")

## Set Up the Project on Your Machine

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

## Configure the Project to Use Your Feed

1. Open ```/src/configuration.js``` file.

2. Update the following information to configure the skill:

    * appId : Your Skill's Application ID from the Skill you created at https://developer.amazon.com.
    * welcome_message : A welcome message that will be spoken to the user when they open your skill.
    * number_feeds_per_prompt : The number of items the skill will read each time the user invokes it.
    * display_only_feed_title : A boolean flag that determines whether to speak out the title-only or title and summary of the items in your feed.
    * display_only_title_in_card : A boolean flag to decide whether to display a card with the title only or title and summary of the items in your feed.
    * categories : The list of RSS feeds you want to include in your Skill.  Each feed will be treated as a category.
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
            'feed name' : 'http://www.example.com/rss-feed.xml'
        },
        speech_style_for_numbering_feeds : 'Item',
        s3BucketName : 'my-feed-skill-bucket',
        dynamoDBTableName : 'MyFeedSkillBucket'
    };
    ```

## Deploy Your Skill

1. Go to the ```skill-sample-nodejs-feed/bin/``` directory and run ```deploy.js``` using Node.

    ```
    npm install aws-sdk
    node deploy.js
    ```
    
2. Go to the the ```skill-sample-nodejs-feed/src/``` directory and zip all of the files.  Be sure to only zip the files inside the directory, and not the directory itself.   Lambda needs to be able to find the ```index.js``` file at the root of the zip file. 

3. Go to the [AWS Console](https://console.aws.amazon.com/console/home?region=us-east-1) and upload the file to your Lambda function, selecting "Code entry type" as "Upload a .ZIP file".

4. Go to the [Developer Portal](https://developer.amazon.com/edw/home.html#/skills/list) copy following content from ```skill-sample-nodejs-feed/speechAssets/``` to the Interaction Model:
    * ```CustomSlots-ORDINALS.txt``` to a new custom slot with Type : ORDINAL
    * ```CustomSlots-CATEGORIES.txt``` to a new custom slot with Type : CATEGORY
        * **Note:** This file is not generated.  You'll need to update it with names for each of the feeds you added in your configuration above.
    * ```IntentSchema.json``` to **Intent Schema**
        * **Note:** You'll need to create the custom slots and save them before you can submit the intent schema that references them.
    * ```Utterances.txt``` to **Sample Utterances**

5. Start testing the skill in the Developer Portal or on your device.

6. Enjoy!

**Note:**  By creating an Alexa skill based on the Feed skill template, you acknowledge ownership of any RSS/ATOM feed(s) used within the skill, and/or have permission to use the RSS/ATOM feed(s) from the original content owner. Failure to be able to prove ownership or permission to use any feed sources, at any time, will likely cause your skill to be rejected during the certification process, or being removed from the Alexa Skill Store without notice at a later date.
