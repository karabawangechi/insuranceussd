const africastalking =  require("africastalking")

const options = {
    apiKey: process.env.apiKey,
    username: process.env.username,
}
const _riskQuestions = [
  {
    question: "Are you a new user or an existing user?",
    options: { newuser: 2, existinguser: 1 },
    followUpQuestions: {
      2: [
        {
          question: "Please select the type of insurance you need:",
          options: {
            insurance1: "Motor Insurance",
            insurance2: "Life Insurance",
            insurance3: "Travel Insurance",
            insurance4: "Education Insurance",
            insurance5: "Fire Insurance",
            insurance6: "Accident Insurance",
            insurance7: "Liability Insurance",
            insurance8: "Child Plan",
            insurance9: "Landlord Insurance",
            insurance10: "Cyber Attack Insurance"
          },
          key: "selectedInsurance"
        },
        {
          question: "Please provide your first name:",
          key: "firstName"
        },
        {
          question: "Please provide your last name:",
          key: "lastName"
        },
        {
          question: "Please provide your date of birth (YYYY-MM-DD):",
          key: "dateOfBirth"
        },
        {
          question: "Please provide your national ID number:",
          key: "nationalID"
        },
        {
          question: "Please provide your phone number:",
          key: "phoneNumber"
        }
      ]
    }
  }
];

// return a few questions for the USSD session
exports.riskQuestions = _riskQuestions.slice(0, 3);

// Function to generate full code
function generateFullCode() {
  const client = africastalking(options)

  // Define USSD handler function
  function ussdHandler(session) {
    session
      .start()
      .then(function (response) {
        let responses = [];
        _riskQuestions.forEach(question => {
          responses.push(question.question);
        });
        session.continue(responses.join("\n"));
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  // Create USSD service
  const ussd = client.ussdService({ provider: "sandbox" });
  ussd.createSession("0769362302", ussdHandler);
}
