# Build An Alexa Feed Reader Skill
<img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/header._TTH_.png" />

[![Voice User Interface](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/1-off._TTH_.png)](./instructions/1-voice-user-interface.md)[![Lambda Function](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/2-off._TTH_.png)](./instructions/2-lambda-function.md)[![Connect VUI to Code](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/3-off._TTH_.png)](./instructions/3-connect-vui-to-code.md)[![Testing](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/4-off._TTH_.png)](./instructions/4-testing.md)[![Customization](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/5-off._TTH_.png)](./instructions/5-customization.md)[![Publication](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/6-off._TTH_.png)](./instructions/6-publication.md)

# Build a Feed Reader Skill for Alexa
This tutorial will walk first-time Alexa skills developers through all the required steps involved in creating a feed reading skill using a template called ‘Feed Reader’. Ask to play your feed and this skill will do so.

# Let's Get Started
If this is your first time here, you're new to Alexa Skills Development, or you're looking for more detailed instructions, click the **Get Started** button below:

<p align='center'>
<a href='./instructions/0-intro.md'><img src='https://camo.githubusercontent.com/db9b9ce26327ad3bac57ec4daf0961a382d75790/68747470733a2f2f6d2e6d656469612d616d617a6f6e2e636f6d2f696d616765732f472f30312f6d6f62696c652d617070732f6465782f616c6578612f616c6578612d736b696c6c732d6b69742f7475746f7269616c732f67656e6572616c2f627574746f6e732f627574746f6e5f6765745f737461727465642e5f5454485f2e706e67'></a>
</p>


Be sure to take a look at the [Additional Resources](#additional-resources) at the bottom of this page!


## About
**Note:** The rest of this readme assumes you have your developer environment ready to go and that you have some familiarity with CLI (Command Line Interface) Tools, [AWS](https://aws.amazon.com/), and the [ASK Developer Portal](https://developer.amazon.com/alexa-skills-kit). If not, [click here](./instructions/0-intro.md) for a more detailed walkthrough.



### Usage

```text
Alexa, ask feed reader to open first feed.
	>> Your first feed is BBC World News.

Alexa, open feed reader
```

### Repository Contents
* `/.ask`	- [ASK CLI (Command Line Interface) Configuration](https://developer.amazon.com/docs/smapi/ask-cli-intro.html)	 
* `/lambda/custom` - Back-End Logic for the Alexa Skill hosted on [AWS Lambda](https://aws.amazon.com/lambda/)
* `/models` - Voice User Interface and Language Specific Interaction Models
* `/instructions` - Step-by-Step Instructions for Getting Started
* `skill.json`	- [Skill Manifest](https://developer.amazon.com/docs/smapi/skill-manifest.html)

## Setup w/ ASK CLI

### Pre-requisites

* Node.js (> v4.3)
* Register for an [AWS Account](https://aws.amazon.com/)
* Register for an [Amazon Developer Account](https://developer.amazon.com/)
* Install and Setup [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html)

### Installation
1. Clone the repository.

	```bash
	$ git clone https://github.com/alexa/skill-sample-nodejs-feed/
	```

2. Initiatialize the [ASK CLI](https://developer.amazon.com/docs/smapi/quick-start-alexa-skills-kit-command-line-interface.html) by Navigating into the repository and running npm command: `ask init`. Follow the prompts.

	```bash
	$ cd skill-sample-nodejs-feed
	$ ask init
	```

3. Install npm dependencies by navigating into the `/lambda/custom` directory and running the npm command: `npm install`

	```bash
	$ cd lambda/custom
	$ npm install
	```


### Deployment

ASK CLI will create the skill and the lambda function for you. The Lambda function will be created in ```us-east-1 (Northern Virginia)``` by default.

1. Deploy the skill and the lambda function in one step by running the following command:

	```bash
	$ ask deploy
	```

### Testing

1. To test, you need to login to Alexa Developer Console, and enable the "Test" switch on your skill from the "Test" Tab.

2. Simulate verbal interaction with your skill through the command line using the following example:

	```bash
	 $ ask simulate -l en-US -t "start feed reader"

	 ✓ Simulation created for simulation id: 4a7a9ed8-94b2-40c0-b3bd-fb63d9887fa7
	◡ Waiting for simulation response{
	  "status": "SUCCESSFUL",
	  ...
	 ```

3. Once the "Test" switch is enabled, your skill can be tested on devices associated with the developer account as well. Speak to Alexa from any enabled device, from your browser at [echosim.io](https://echosim.io/welcome), or through your Amazon Mobile App and say :

	```text
	Alexa, start feed reader
	```

## Customization

1. ```./skill.json```

   Change the skill name, example phrase, icons, testing instructions etc ...

   Remember that many information is locale-specific and must be changed for each locale (en-GB and en-US)

   See the Skill [Manifest Documentation](https://developer.amazon.com/docs/smapi/skill-manifest.html) for more information.

2. ```./lambda/custom/index.js```

   Modify messages, and facts from the source code to customize the skill.

3. ```./models/*.json```

	Change the model definition to replace the invocation name and the sample phrase for each intent.  Repeat the operation for each locale you are planning to support.

## Additional Resources

### Community
* [Amazon Developer Forums](https://forums.developer.amazon.com/spaces/165/index.html) - Join the conversation!
* [Hackster.io](https://www.hackster.io/amazon-alexa) - See what others are building with Alexa.

### Tutorials & Guides
* [Voice Design Guide](https://developer.amazon.com/designing-for-voice/) - A great resource for learning conversational and voice user interface design.
* [CodeAcademy: Learn Alexa](https://www.codecademy.com/learn/learn-alexa) - Learn how to build an Alexa Skill from within your browser with this beginner friendly tutorial on CodeAcademy!

###Documentation
* [Official Alexa Skills Kit Node.js SDK](https://www.npmjs.com/package/alexa-sdk) - The Official Node.js SDK Documentation
*  [Official Alexa Skills Kit Documentation](https://developer.amazon.com/docs/ask-overviews/build-skills-with-the-alexa-skills-kit.html) - Official Alexa Skills Kit Documentation

<img height="1" width="1" src="https://www.facebook.com/tr?id=1847448698846169&ev=PageView&noscript=1"/>


<!-- # RSS/Atom Feed Sample Project

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

1. Open ```/lambda/custom/configuration.js``` file.

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
    let config = {
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

1. Go to the ```skill-sample-nodejs-feed/lambda/bin/``` directory and run ```deploy.js``` using Node.

    ```
    npm install aws-sdk
    node deploy.js
    ```

2. Go to the the ```skill-sample-nodejs-feed/lambda/custom/``` directory and zip all of the files.  Be sure to only zip the files inside the directory, and not the directory itself.   Lambda needs to be able to find the ```index.js``` file at the root of the zip file.

3. Go to the [AWS Console](https://console.aws.amazon.com/console/home?region=us-east-1) and upload the file to your Lambda function, selecting "Code entry type" as "Upload a .ZIP file".

4. Go to the [Developer Portal](https://developer.amazon.com/edw/home.html#/skills/list) copy following content from ```skill-sample-nodejs-feed/models/``` to the Interaction Model:
    * ```CustomSlots-ORDINALS.txt``` to a new custom slot with Type : ORDINAL
    * ```CustomSlots-CATEGORIES.txt``` to a new custom slot with Type : CATEGORY
        * **Note:** This file is not generated.  You'll need to update it with names for each of the feeds you added in your configuration above.
    * ```IntentSchema.json``` to **Intent Schema**
        * **Note:** You'll need to create the custom slots and save them before you can submit the intent schema that references them.
    * ```Utterances.txt``` to **Sample Utterances**

5. Start testing the skill in the Developer Portal or on your device.

6. Enjoy!

-->
