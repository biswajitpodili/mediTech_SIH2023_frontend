var $messages = $('.messages-content');
var final = false;
const aliases = {
  "fatigue": "weak",
  "fever": "high temperature",
  "headache": "pain in head",
  "stomachache": "pain in stomach"
}
const symptoms = ['fatigue', 'fever', 'headache', 'stomachache'];
var askSymptoms = [];
var userSymptoms = [];
var responses = {
  "fatigue": "If you are feeling weak, it may be due to stress or lack of sleep.<br> Take some rest, drink adequate water, maybe go out for a walk or do something you like to do.",
  "fever": "If you only have fever, it may be a common cold.<br> Drink adequate warm fluid, and take some rest.<br> Avoid using fans, coolers or ACs.<br> If the fever gets severe, immediately visit your nearest doctor or you can ask me to connect you to one",
  "headache": "If it is just a headache, it may be due to stress or lack of sleep.<br> Take some rest, drink adequate water, maybe go out for a walk or focus on something you like to do.",
  "stomachache": "If your stomach hurts, it may be due to indigestion.<br> Drink some water with ginger, fennel seeds or lemon.<br> Keep drinking enough water throughout and the problem should be solved.<br> If the problem persists, visit your nearest doctor or you can ask me to connect you to one",
  "fatigue-fever": "Feeling weak is common with a fever. <br> It may be common cold or flu. <br> Take some rest and consume more warm fluid.<br> If the problem becomes severe contact your nearest doctor or you can ask me to connect you to one.",
  "fatigue-headache": "There is a small chance that it could be Covid19 or Migraine. <br> Please visit your nearest doctor or ask me to contact one for you.",
  "fatigue-stomachache": "You may be suffering from malnutrition. <br> Eat more nutritious food and take some rest and consume more warm fluid.<br> If the problem becomes severe contact your nearest doctor or you can ask me to connect you to one.",
  "fever-headache": "According to your symptoms, you may have flu or cold.<br> Take some rest and consume more warm fluid.<br> If the problem becomes severe contact your nearest doctor or you can ask me to connect you to one.",
  "fever-stomachache": "You may have Malaria. <br> Please visit your nearest doctor or ask me to contact one for you.",
  "headache-stomachache": "You may be suffering from dehydration. <br> Try to drink more amount of water. <br> Please visit your nearest doctor or ask me to contact one for you.",
  "fatigue-fever-headache": "You may have dengue. <br> Please visit your nearest doctor or ask me to contact one for you.",
  "fatigue-fever-stomachache": "You may have hepatitis b. <br> Please visit your nearest doctor or ask me to contact one for you.",
  "fatigue-headache-stomachache": "",
  "fever-headache-stomachache": "You may have food poisoning. <br> Avoid eating and consume only fluids. <br> Also please visit your nearest doctor or ask me to contact one for you.",
  "fatigue-fever-headache-stomachache": "You may have typhoid. <br> Please visit your nearest doctor or ask me to contact one for you."
};

//
//INITIALIZING SPEECH RECOGNITION
//
try {
  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = new SpeechRecognition();
}
catch(e) {
  console.error(e);
  $('.no-browser-support').show();
}

$('#start-record-btn').on('click', function(e) {
  recognition.start();
});

recognition.onresult = (event) => {
  const speechToText = event.results[0][0].transcript;
 document.getElementById("MSG").value= speechToText;
  //console.log(speechToText)
  insertMessage()
}




//
// START OF CONVERSATION
//
$(window).load(function() {
  $messages.mCustomScrollbar();
  setTimeout(function() {
    serverMessage("Hey there! I am medibot, a health diagnosis chatbot. Tell me your name.");
  }, 100);

});


// SCROLLS DOWN TO BOTTOM
function updateScrollbar() {
  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
    scrollInertia: 10,
    timeout: 0
  });
}

// SETTING UP CALLBACK FOR SUBMIT BUTTON
document.getElementById("mymsg").onsubmit = async (e)=>{
  e.preventDefault() 
  const response2 = await insertMessage();
  console.log(response2);
  if (final && response2.intent == "affirm" && response2.entities[0].option == "yes") {
    serverMessage(responses['fatigue-fever-headache-stomachache']);
  }
  if (response2.answer === undefined) {
    serverMessage("Sorry, I couldn't understand that.");
    return false;
  }
  if (response2.intent == "symptom")
  {
    response2.entities.forEach(obj => {
      if (obj.entity == "symptom" && obj.option && !userSymptoms.includes(obj.option)) userSymptoms.push(obj.option);
    });
    console.log(userSymptoms);
  }
  
  if (userSymptoms.length == 4) {
    
    if (response2.intent == 'doctor.connect') {
      serverMessage(response2.answer);
    }else{
      serverMessage(responses['fatigue-fever-headache-stomachache']);
    }
    
  }


  // if (response2.intent == 'doctor.connect') {
  //   serverMessage(response2.answer);
  // }
  else if (response2.intent == "affirm" && response2.entities[0].option == "no")
  {
    const msgi = userSymptoms.sort().join("-");
    //console.log(msgi);
    serverMessage(responses[msgi]);
  }
  else if (response2.intent == "affirm" && response2.entities[0].option == "yes")
  {
    serverMessage(response2.answer);
  }
  else if (userSymptoms.length > 1)
  {
    symptoms.forEach(s => {
      if (!userSymptoms.includes(s)) askSymptoms.push(s);
    })
    if (askSymptoms.length == 2) serverMessage("Do you feel " + aliases[askSymptoms[0]] + " or " + aliases[askSymptoms[1]] + "?");
    else if (askSymptoms.length == 1) serverMessage("Do you feel " + aliases[askSymptoms[0]] +"?");
  } 
  else if (response2.intent != "affirm")
  {
    serverMessage(response2.answer);
  }
  else
  {
    serverMessage("error");
  }
  // switch (num) {
  //   case 0:
  //     serverMessage("Hi Mark, are you feeling well?");
  //     speechSynthesis.speak( new SpeechSynthesisUtterance("hello"))
  // }
  //serverMessage("hello");
  //speechSynthesis.speak( new SpeechSynthesisUtterance("hello"))
}

//INSERT USER'S MESSAGE IN THE CHAT HISTORY
async function insertMessage() {
  msg = $('.message-input').val();
  if ($.trim(msg) == '') {
    return false;
  }
  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
  
  $('.message-input').val(null);
  updateScrollbar();
  return await fetchmsg(msg);
}

// INSERT BOT'S RESPONSE IN THE CHAT HISTORY
function serverMessage(response2) {


  if ($('.message-input').val() != '') {
    return false;
  }
  $('<div class="message loading new"><figure class="avatar"><img src="css/bot.png" /></figure><span></span></div>').appendTo($('.mCSB_container'));
  updateScrollbar();
  

  setTimeout(function() {
    $('.message.loading').remove();
    $('<div class="message new"><figure class="avatar"><img src="css/bot.png" /></figure>' + response2 + '</div>').appendTo($('.mCSB_container')).addClass('new');
    speechSynthesis.speak( new SpeechSynthesisUtterance(response2));
    updateScrollbar();
  }, 100 + (Math.random() * 20) * 100);

}


async function fetchmsg(msg){
  const msgObject = {
    msg
  }

  try {
    const response = await fetch('http://localhost:3000/bot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(msgObject)
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse);

    return jsonResponse;

    // if (response.status === 201) {
    //   // Product created successfully
    //   fetchProducts(); // Refresh the product list
    // } else {
    //   console.error('Error creating product');
    // }
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
}


