"use strict"
var mongoose = require('mongoose');

var pathwaysSchema = mongoose.Schema({
  name: String,
  pathwayContentDisplayName: String,
  previewImage: String,
  imageAltTag: String,
  comingSoon: Boolean,
  showToUsers: Boolean,
  url: String,
  sponsor: {
      // sponsor company's name
      name: String,
      // path to sponsor company's logo
      logo: String,
      // path to a darker version of sponsor company's logo
      logoForLightBackground: String,
      // short description of the pathway shown on pathway landing page
      pathwayHomepage: String,
      // longer description of the pathway
      description: String,
      // if the overview of the steps of the pathway should be shown
      displaySteps: Boolean,
      // the company's website
      homepage: String,
      // the company's site that lists all open positions (usually shouldn't use this)
      careerPage: String,
      // what position the company is hiring for
      hiring: String,
      // intro to saying what the user will learn
      learn: String,
      // random information under a signup button on the page
      infoUnderButton: String,
      // text to show on button above infoUnderButton
      buttonText: String,
      // link to the company's blog
      blog: String,
      // demo video of what the company is like
      demo: String,
      // path to image to show if no quote
      quoteReplacement: String,
      // alt text for image that is potentially replacing quote
      quoteReplacementAltTag: String,
      // quote from someone at the company
      quote: {
          body: String,
          speakerImage: String,
          speakerName: String,
          speakerTitle: String
      },
      // description of the position you can get by going through the pathway
      positionDescription: {
          // title the user would have with this career
          title: String,
          // text on call-to-action button
          buttonText: String,
          // whether to display the position info after the video for the company
          displayAfter: Boolean,
          // whether to display the position info before the video for the company
          displayBefore: Boolean,
          // whether to have a spacer before the position info
          spacer: Boolean,
          // small things describing the position
          frames: [{
              // text to show next to the icon
              description: String,
              // icon that relates to the info about the position
              icon: String,
              // alt text for the icon
              iconAltTag: String
          }]
      },
      // random info about the pathway/company/position
      info: [{
          // icon that relates to the info
          icon: String,
          // summary of the info
          title: String,
          // longer description of the info
          description: String,
          // alt text for the icon
          iconAltTag: String
      }],
      // more random info about the pathway/company/position
      info2: [{
          // icon that relates to the info
          icon: String,
          // summary of the info
          title: String,
          // longer description of the info
          description: String,
          // alt text for the icon
          iconAltTag: String
      }],
      // another brief video describing the company/position
      video: {
          // link to the YouTube video
          link: String,
          // title for the video
          title: String,
          // if the video needs a spacer before it
          spacer: Boolean
      },
      // some benefits the user will get at the company
      benefits: [{
          // path to icon that corresponds to the benefit info
          icon: String,
          // alt tag for the icon
          iconAltTag: String,
          // the info about the benefit
          description: String
      }]
  },
  // how long we estimate it will take for the student to complete the pathway
  estimatedCompletionTime: String,
  // when the student must complete the pathway by
  deadline: Date,
  // price to the student, will probably always be free
  price: String,
  // whether we should show the box that has overview, comments, and exercise files
  showOverviewAndCommentBox: Boolean,
  // comments on the pathway
  comments: [{ email: String, body: String, date: Date }],
  // ratings on the pathway from one to five
  ratings: [{ email: String, rating: Number }],
  // average of all the ratings, should be a number 1-5
  avgRating: Number,
  // description to be shown in search engine results for this pathway
  metaDescription: String,
  tags: [ String ],
  industry: { averageSalary: String, title: String },
  extraInfo: String,
  referralQuestionId: mongoose.Schema.Types.ObjectId,
  projects: [{
      name: String,
      description: String,
      difficulty: String,
      estimatedTime: String
  }],
  steps: [{
      name: String,
      order: Number,
      description: String,
      subSteps: [{
          order: Number,
          superStepOrder: Number,
          name: String,
          contentType: String,
          contentID: mongoose.Schema.Types.ObjectId,
          comments: [{ email: String, body: String, date: Date }]
      }]
  }]
});

var Pathways = mongoose.model('Pathways', pathwaysSchema);
module.exports = Pathways;
