# Build An Alexa Feed Reader Skill
[![Voice User Interface](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/1-locked._TTH_.png)](./1-voice-user-interface.md)[![Lambda Function](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/2-on._TTH_.png)](./2-lambda-function.md)[![Connect VUI to Code](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/3-off._TTH_.png)](./3-connect-vui-to-code.md)[![Testing](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/4-off._TTH_.png)](https://github.com/alexa/sskill-sample-nodejs-feed/blob/master/instructions/4-testing.md)[![Customization](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/5-off._TTH_.png)](./5-customization.md)[![Publication](https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/navigation/6-off._TTH_.png)](./6-publication.md)

## Setting Up A Lambda Function Using Amazon Web Services

In the [first step of this guide](./1-voice-user-interface.md), we built the Voice User Interface (VUI) for our Alexa skill.  On this page, we will be creating an AWS Lambda function using [Amazon Web Services](http://aws.amazon.com).  You can [read more about what a Lambda function is](http://aws.amazon.com/lambda), but for the purposes of this guide, what you need to know is that AWS Lambda is where our code lives.  When a user asks Alexa to use our skill, it is our AWS Lambda function that interprets the appropriate interaction, and provides the conversation back to the user.

1.  **Go to http://aws.amazon.com and sign in to the console.** If you don't already have an account, you will need to create one.  [If you don't have an AWS account, check out this quick walkthrough for setting it up](https://github.com/alexa/alexa-cookbook/tree/master/aws/set-up-aws.md).

    <a href="https://console.aws.amazon.com/console/home" target="_new"><img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-1-sign-in-to-the-console._TTH_.png" /></a>

2.  **Click "Services" at the top of the screen, and type "Lambda" in the search box.**  You can also find Lambda in the list of services.  It is in the "Compute" section.

    <a href="https://console.aws.amazon.com/lambda/home" target="_new"><img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-2-services-lambda._TTH_.png" /></a>

3.  **Check your AWS region.** AWS Lambda only works with the Alexa Skills Kit in two regions: US East (N. Virginia) and EU (Ireland).  Make sure you choose the region closest to your customers.

    <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-3-check-region._TTH_.png"/>

4.  **Click the "Create a Lambda function" button.** It should be near the top of your screen.  (If you don't see this button, it is because you haven't created a Lambda function before.  Click the blue "Get Started" button near the center of your screen.)

    <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-4-create-a-lambda-function._TTH_.png" />

5. **Skip the blueprint and choose your role.**
  * Under "Create Function", make sure that "Author from scratch" is selected.
  * The name of your function will only be visible to you, but make sure that you name it something meaningful.  "FeedReader" is sufficient if you don't have another idea for a name.

  <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-7-configure-your-function._TTH_.png" />  

6. Create an AWS Role in IAM with access to DynamoDB, S3 and CloudWatch logs. If you haven't done this before, we have a [detailed walkthrough for setting up your first role for Lambda](https://github.com/alexa/alexa-cookbook/tree/master/aws/lambda-role.md)

   ![create_role_1](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-1.PNG "AWS Create Role Screenshot 1")
   ![create_role_2](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-2.PNG "AWS Create Role Screenshot 2")
   ![create_role_3](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-role-screenshot-3.PNG "AWS Create Role Screenshot 3")

   * Once you've set up your role, click the "Create Function" button in the bottom right corner.

7. **Configure your trigger.** Look at the column on the left called "Add triggers", and select Alexa Skills Kit from the list.  If you don't see Alexa Skills Kit in the list, jump back to step #3 on this page.

  <!-- <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/2-6-configure-your-trigger._TTH_.png" /> TODO: THIS SCREENSHOT IS OUT OF DATE-->

  Once you have selected Alexa Skills Kit, scroll down and click the **Add** button. Then click the **Save** button in the top right. You should see a green success message at the top of your screen. Now, click the box that has the Lambda icon followed by the name of your function (FeedReader if you used our suggestion) and scroll down to the field called "Function code".

8. **For this skill, you'll need to set up your local environment to run the deployment script.**  

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

9. Configure the Project to Use Your Feed

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

10. Deploy Your Skill

      1. Go to the ```skill-sample-nodejs-feed/lambda/bin/``` directory and run ```deploy.js``` using Node.

          ```
          npm install aws-sdk
          node deploy.js
          ```

      2. Go to the the ```skill-sample-nodejs-feed/lambda/custom/``` directory and zip all of the files.  Be sure to only zip the files inside the directory, and not the directory itself.   Lambda needs to be able to find the ```index.js``` file at the root of the zip file.

      3. Go to the [AWS Console](https://console.aws.amazon.com/console/home?region=us-east-1) and upload the file to your Lambda function, selecting "Code entry type" as "Upload a .ZIP file".

11. **Configure the rest of your function**
    1. Scroll to the sections below "Function code"
    1. Change the "Timeout" to 30 seconds, since feeds can become an issue.
    1. Leave the defaults for everything else.
    1. Note the ARN of the Lambda you've created, which you'll need later.

    1. In another tab, go to the AWS console and create an AWS S3 Bucket with the name of your choice. Note, the S3 bucket name you choose must be unique across all existing bucket names in Amazon S3. Thus you may have to retry with another name in case of a conflict.

          ![alt text](https://s3.amazonaws.com/lantern-public-assets/sample-skill-nodejs-feed/aws-create-s3-bucket-screenshot-1.PNG "AWS DynamoDB Screenshot")

    1. **[OPTIONAL]** Create an AWS DynamoDB table named MyFeedSkillTable with the case sensitive primary key "userId".

             ![alt text](https://cloud.githubusercontent.com/assets/7671574/17307587/b80787f2-57ea-11e6-9be2-3df26e8e5947.png "AWS DynamoDB Screenshot")

11. **After you create the function, the ARN value appears in the top right corner. Copy this value for use in the next section of the guide.**

    <img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/quiz-game/2-12-copy-ARN._TTH_.png" />  <!--TODO: THIS IMAGE NEEDS TO BE CUSTOMIZED FOR YOUR SKILL TEMPLATE. -->

<br/><br/>
<a href="./3-connect-vui-to-code.md"><img src="https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/tutorials/general/buttons/button_next_connect_vui_to_code._TTH_.png"/></a>

<img height="1" width="1" src="https://www.facebook.com/tr?id=1847448698846169&ev=PageView&noscript=1"/>
