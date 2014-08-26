var Matti = function(){
	var questionBank = {},
		curseBank = ["ass","cunt","bitch","fuck","shit","dick","asshole","twat","motherfucker"];

	/**
	* Quasi-constructor method that is run the moment the object is instatiated.
	*/
	(function(){
		getQuestionBankData();
		assignEventListeners();
		parseQueryString();
	})();

	/**
	* Gets the QuestionBank.json file.
	*/
	function getQuestionBankData(){
        var xhr, versions, i;

        if(typeof XMLHttpRequest !== 'undefined'){
        	xhr = new XMLHttpRequest();
        }
        else {
            versions = ["MSXML2.XmlHttp.5.0", 
                        "MSXML2.XmlHttp.4.0",
                        "MSXML2.XmlHttp.3.0", 
                        "MSXML2.XmlHttp.2.0",
                        "Microsoft.XmlHttp"]
 
             for(i = 0, len = versions.length; i < len; i++) {
                try {
                    xhr = new ActiveXObject(versions[i]);
                    break;
                }
                catch(e){}
             }
        }
         
        xhr.onreadystatechange = ensureReadiness;
         
        function ensureReadiness() {
            if(xhr.readyState < 4 || xhr.status !== 200) {return;}
            if(xhr.readyState === 4) {assignQuestionBankData(xhr.response);}           
        }
         
        xhr.open('GET', 'js/QuestionBank.json', true);
        xhr.send('');
	}

	/**
	* Parses the value of bankDataString and assigns it to questionBank.
	* @param bankDataString - The string version of QuestionBank.json
	*/
	function assignQuestionBankData(bankDataString){
		questionBank = JSON.parse(bankDataString);
	}

	/**
	* Assigns event listeners to elements in the HTML.
	*/
	function assignEventListeners(){
		document.getElementById('questionSubmit').addEventListener('click', handleQuestionSubmit);
	}

	/**
	* Handles the click event of the question form button.
	* @param e - The event object
	*/
	function handleQuestionSubmit(e){
		log('handleQuestionSubmit invoked...');

		document.getElementById('questionForm').submit();
	}

	/**
	* Parses the query string in the url for the individual compoents of the statement or question.
	*/
	function parseQueryString(){
		log('parseQueryString invoked...');
		var rawQueryString = window.location.search,
			queryStringPrefixLength = rawQueryString.indexOf('q=') + 2,
			rawParamArray = unescape(rawQueryString).substring(queryStringPrefixLength, rawQueryString.length).split('+'),
			queryParamsArray = rawParamArray.map(function(n){
				return n.replace(/[\'\?\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase();
			}),
			questionCallback;

		if(queryParamsArray.toString().length > 1){
			if(checkForCursing(queryParamsArray) == true){
				questionCallback = handleCurseQuestion;
			}
			else{
				questionCallback = handleQuestion;
			}

			setTimeout(function(){
				sendReply(questionCallback(queryParamsArray));
			},20);
		}
	}

	/**
	* Checks the question array for the existance of known curse words.
	* @param arr - An array containing the individual element of the query string.
	*/
	function checkForCursing(arr){
		var i, j;

		for(i = 0; i < arr.length; i++){
			for(j = 0; j < curseBank.length; j++){
				if(arr[i] == curseBank[j]){
					return true;
				}
			}
		}

		return false;
	}

	/**
	* Parses the array to determine the most accurate response.
	* @param arr - An array containing the individual element of the query string.
	*/
	function handleQuestion(arr){
		log('handleQuestion invoked...');
		var questionObject = questionBank,
			returnValue,
			i;

		for(i = 0; i < arr.length; i++){
			var currentVal = arr[i];
			try{questionObject = questionObject[currentVal];}
			catch(e){questionObject = handleUnknownQuestion(); break;}
		}

		switch(typeof questionObject){
			case "string": returnValue = questionObject; break;
			case "object" : returnValue = eval(questionObject[1] + "()"); break;
			default: returnValue = handleUnknownQuestion();
		}

		return returnValue;
	}

	/**
	* If the question or statement being asked is unrecognized, then a random unknown resonse is given.
	*/
	function handleUnknownQuestion(){
		log('handleUnknownQuestion invoked...');
		var unknownResponses = questionBank.unknown,
			randomResponse = Math.floor((Math.random() * unknownResponses.length) + 0);
		
		return unknownResponses[randomResponse];
	}

	/**
	* If the question ro statment being asked contains a known curse word, then a random curse response is given.
	*/
	function handleCurseQuestion(){
		log('handleCurseQuestion invoked...');
		var curseResponses = questionBank.curse,
			randomResponse = Math.floor((Math.random() * curseResponses.length) + 0);
		
		return curseResponses[randomResponse];
	}

	/**
	* Appends the value of the response to the proper HTML element.
	* @param response - The string response from the QuestionBank.
	*/
	function sendReply(response){
		document.getElementById("response").innerHTML = response;
	}

	/**
	* Returns the current time.
	*/
	function showTime(){
		log("showTime invoked...");
		var today = new Date(),
			h = today.getHours(),
			m = today.getMinutes();
		
		return h + ":" + m;
	}

	/**
	* Returns the current date.
	*/
	function showDate(){
		log("showDate invoked...");
		var today = new Date(),
			dd = today.getDate(),
			mm = today.getMonth() + 1,
			yyyy = today.getFullYear();

		return mm + '/' + dd + '/' + yyyy;
	}

	/**
	* Abstracts the console.log method so that exceptions aren't thrown.
	* @param msg - The message being sent to the console object.
	*/
	function log(msg){
		if(console && console.log){
			console.log(msg);
		}
	}

	/**
	* Focuses the cursor on the input textfield in the HTML.
	*/
	this.focusCursor = function(){
		document.getElementById('questionData').focus();
	}

	return this;
}

document.addEventListener('DOMContentLoaded', function(){
	var mattiObj = new Matti();
	mattiObj.focusCursor();
});