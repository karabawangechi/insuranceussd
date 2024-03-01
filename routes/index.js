const express = require('express');

const riskQuestions = require('../utils/index.js');

const sendSMS = require('../utils/sendsms.js');


const router = express.Router();


// In-memory data store for survey responses

const customers = new Map();


// Function to handle customer data

function handleCustomerData(phoneNumber, sessionId, answer) {

  const customer = customers.get(sessionId);


  if (!customer) {

    // This is a new customer

    customers.set(sessionId, {

      sessionId,

      phoneNumber,

      currentQuestionIndex: 0,

      answers: [],

      isNewUser: null,

      insuranceType: null,

    });

  } else {

    // Update customer data

    const customerData = customers.get(sessionId);

    if (customerData.currentQuestionIndex === 0) {

      customers.set(sessionId, {

        ...customerData,

        sessionId,

        currentQuestionIndex: customerData.currentQuestionIndex + 1,

        isNewUser: answer ===  '2' ?true : false,

      });

    } else if (customerData.currentQuestionIndex === 2 && customerData.isNewUser) {

      customers.set(sessionId, {

        ...customerData,

        sessionId,

        currentQuestionIndex: customerData.currentQuestionIndex + 1,

        insuranceType: answer,

      });

    } else {

      customers.set(sessionId, {

        ...customerData,

        sessionId,

        currentQuestionIndex: customerData.currentQuestionIndex + 1,

        answers: [...customerData.answers, answer],

      });

    }

  }


  return customers.get(sessionId);

}


// Function to handle USSD requests
  function handleUssd(req, res) {
    const questions = riskQuestions;
    const { phoneNumber, sessionId, text } = req.body;
    const answer = text.trim().toLowerCase();
    const customerData = handleCustomerData(phoneNumber, sessionId, answer);
    const { currentQuestionIndex, isNewUser, insuranceType } = customerData;
    let response = '';
  
    if (currentQuestionIndex === 0) {
      // Ask if new user or existing user
      response = `CON Are you a new user or an existing user?\n\n Reply with either:\n\n1. Existing user\n2. New user`;
    } else if (currentQuestionIndex === 1 && isNewUser) {
      // Ask for insurance type
      response = `CON Please select the type of insurance you need:\n\n1. Motor Insurance\n2. Life Insurance\n3. Travel Insurance\n4. Education Insurance\n5. Fire Insurance\n6. Accident Insurance\n7. Liability Insurance\n8. Child Plan\n9. Landlord Insurance\n10. Cyber Attack Insurance`;
    } else if (currentQuestionIndex === 2 && isNewUser) {
      // Ask for user details
      response = `CON Please enter your name:`;
    } else if (currentQuestionIndex === 3 && isNewUser) {
      // Prompt for date of birth
      response = `CON Please enter your date of birth (YYYY-MM-DD):`;
    } else if (currentQuestionIndex === 4 && isNewUser) {
      // Prompt for national ID
      response = `CON Please enter your national ID:`;
    } else if (currentQuestionIndex === 5 && isNewUser) {
      // Prompt for phone number
      response = `CON Please enter your phone number:`;
    } else if (currentQuestionIndex === 6 && isNewUser && insuranceType === '1') {
      // Prompt for motor insurance details
      response = `CON Please enter the make of your vehicle:`;
    } else if (currentQuestionIndex === 7 && isNewUser && insuranceType === '1') {
      // Prompt for vehicle model
      response = `CON Please enter the model of your vehicle:`;
    } else if (currentQuestionIndex === 8 && isNewUser && insuranceType === '1') {
      // Prompt for vehicle value
      response = `CON Please enter the value of your vehicle:`;
    } else if (currentQuestionIndex === 9 && isNewUser && insuranceType === '1') {
      // Prompt for coverage period
      response = `CON Please enter the coverage period for your insurance (in years):`;
    } else {
      // Handle other questions or end of survey
      const quiz = questions[currentQuestionIndex - 1];
      const question = quiz?.question;
      const options = Object.keys(quiz?.options || {});
      response = `CON ${question}\n\n Reply with either:\n\n${options.join('\n ')}`;
    }
  
    if (currentQuestionIndex === 10 && isNewUser && insuranceType === '1') {
      // After completing motor insurance details, send confirmation message
      const message = `Thank you for selecting motor insurance. We will review your details and get back to you shortly.`;
      sendSMS({ phoneNumber, message });
      response = `END ${response}`; // End the session after sending the confirmation
    }
  
    customers.delete(phoneNumber);
    return res.send(response);
  }
  


// Function to calculate risk score based on user responses

const calculateRiskScore = (answers) => {

  let riskScore = 0;


  answers.forEach((response, index) => {

    const options = riskQuestions[index].options;

    const score = options?.[response] || 0;

    riskScore += score;

  });


  return riskScore;

};

router.post("/api", handleUssd);
module.exports =  router;
