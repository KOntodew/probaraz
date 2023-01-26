document.addEventListener('DOMContentLoaded', function() {
	
	const content = document.getElementById("content");
	const name = document.getElementById("name");
	const options = document.getElementsByTagName("option");
	const active = document.querySelector(".active");
	const all_question_cards =  document.getElementsByClassName("question");
	const hello_card = document.getElementById("hello");
	const next_button_in_hello_card = document.getElementById("button");
	const next_button_in_question_card = document.getElementsByClassName("button");
	const questions_number = 3;
	const score = [];	 
	
	const start_quiz = {
		category: "deflaut",
		
		get_name: function() {
			const read_name = name.value;
			return read_name;
		},
		
		get_category: function() {
			for (i=0; i < options.length; i++) {
				if (options[i].selected) {
					category = options[i].value
				}
			}
			return category;
		},
		// switch first card with category choice to second card with first question
		change_card: function() {
			next_button_in_hello_card.addEventListener("click", function() {
				const read_category = start_quiz.get_category();
				if (name.value == "" || name.value.length < 3) {
					name.classList.add("wrong_name");
					return;
				}
				solve_quiz.read_status_and_parse_json(read_category);
				active.nextElementSibling.classList.add("active");
				active.classList.remove("active");
			} )
		}
	}
	
	
	const solve_quiz = {

		read_status_and_parse_json: function(read_category) { 
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.onreadystatechange = function() {					// lub  xmlhttp.addEventListener('readystatechange', function() { }
				if (this.readyState == 4 && this.status == 200) {
					var myObj = JSON.parse(this.responseText);
					solve_quiz.add_questions_and_answers(myObj);
				}
			};
					
			xmlhttp.open("GET", "./" + read_category + ".json", true);
			xmlhttp.send();
		},

		add_questions_and_answers: function(arr) {
			const cards = solve_quiz.add_question_cards();
			for (i=0; i < cards.length; i++) {
				const number_of_question = solve_quiz.random_question(arr);
				const next_button = document.createElement("button");
				const check_answer_button = document.createElement("button");
				const header = document.createElement("h2");
				const paragraph = document.createElement("p");
				const ul_list = document.createElement("ul");
				const card_list_elements = [];
				const card_inputs = [];
				next_button.innerText = "Next";
				next_button.classList.add("button");
				next_button.id = i;
				check_answer_button.innerText = "Check Answer";
				check_answer_button.classList.add("check-answer-button");
				check_answer_button.id = i;
				paragraph.classList.add("answers-paragraph");
				header.classList.add("answers-header");
				header.innerText = arr[number_of_question].text
				cards[i].appendChild(header);
				cards[i].appendChild(paragraph);
				paragraph.appendChild(ul_list);
				for (let j=0; j < arr[number_of_question].choices.length; j++) {
					const li = document.createElement("li");
					const label = document.createElement("label");
					const answer = document.createElement("input");
					answer.type = "radio";
					answer.name = "answer";
					const id = i.toString()+j.toString();
					answer.id = id
					const for_label = label.setAttribute("for", id);
					label.innerText = arr[number_of_question].choices[j];
					ul_list.appendChild(li);
					li.appendChild(answer);
					li.appendChild(label);
					//label.insertBefore(answer, label.childNodes[0]); //lub li.appendChild(answer);
					card_list_elements.push(li);
					card_inputs.push(answer);
				}
				cards[i].appendChild(check_answer_button);
				cards[i].appendChild(next_button);

				solve_quiz.check_answers(card_list_elements, arr[number_of_question], check_answer_button, next_button);
				solve_quiz.switch_question_card_and_count_score(card_list_elements, arr[number_of_question], next_button);
				arr.splice(number_of_question, 1);
			}
			set_score.add_score_card();
		},
		
		add_question_cards: function () {
			const cards_array = [all_question_cards[0]];
			for (let i=2; i <= questions_number; i++) {
				const card = document.createElement("div");
				card.id = "question"+i;
				card.classList.add("card");
				card.classList.add("question");
				content.appendChild(card);
				cards_array.push(card);
			}
			return cards_array;
		},
		
		random_question: function(arr) {
			let questions = arr.length
			const random = Math.floor(Math.random() * (questions-1));
			questions -= 1; 
			return random;
		},
		
		check_answers: function(list_element, question, check_answer_button) {
				check_answer_button.addEventListener("click", function(e) {
					const all_checkbox = [];
					for (i=0; i < list_element.length; i++) {
						if (list_element[i].childNodes[0].checked && list_element[i].childNodes[1].innerText == question.correct) {	
							list_element[i].classList.add("correct_answer");				
						}
						if (list_element[i].childNodes[0].checked && list_element[i].childNodes[1].innerText != question.correct) {	
							list_element[i].classList.add("bad_answer");
						}
						if (list_element[i].childNodes[0].checked === false) {
							all_checkbox.push(i);
						}
					}
					// if none of answers is checked
					if (all_checkbox.length == 3) {
						return;
					}
					// block all answers and check_answer_button
					for (i=0; i < list_element.length; i++) {
						list_element[i].childNodes[0].disabled = true;
					}
					check_answer_button.disabled = true;
				} )
		},
		
		switch_question_card_and_count_score: function(list_element, question, next_button) {
			next_button.addEventListener("click", function(e) {
				const all_checkbox = [];
				for (i=0; i < list_element.length; i++) {
					if (list_element[i].childNodes[0].checked && list_element[i].childNodes[1].innerText == question.correct) {	
						score.push(1);					
					}
					if (list_element[i].childNodes[0].checked === false) {
						all_checkbox.push(i);
					}
				}
				// if none of answers is checked
				if (all_checkbox.length == 4) {
					return;
				}
				// add score count to score card
				if (e.target.id == next_button_in_question_card.length-1) {
					set_score.add_score_to_score_card(score);
				}
				// swith question card
				document.querySelector(".active").nextElementSibling.classList.add("active");
				document.querySelector(".active").classList.remove("active");
				
			})
		}
	}
	
	const set_score = { 
	
		add_score_card: function() {
			const score_card = document.createElement("div");
			score_card.id = "score";
			score_card.classList.add("card");
			content.appendChild(score_card);
			//return score_card
		},
		
		add_score_to_score_card: function(score) {
			const set_name = start_quiz.get_name();
			const get_score_card = document.getElementById("score");
			const score_div = document.createElement("div");
			const score_header = document.createElement("h2");
			score_header.id = "score_header";
			score_div.id = "score_div";
			score_header.innerText = set_name + ", your score: " + score.length + " / " + all_question_cards.length;
			get_score_card.appendChild(score_div);
			score_div.appendChild(score_header);
			this.add_play_again_button(get_score_card)
		},
		
		add_play_again_button: function(get_score_card) {
			const play_again_button = document.createElement("button");
			play_again_button.classList.add("end-button");
			play_again_button.innerText = "Another Quiz";
			get_score_card.appendChild(play_again_button);
			this.refresh_screen(play_again_button)
		},
		
		refresh_screen: function(play_again_button) {
			play_again_button.addEventListener("click", function() {
				location.reload();
			} )
		}
	}
	
	start_quiz.change_card();
	
});