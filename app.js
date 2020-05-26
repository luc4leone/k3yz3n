/* 
some references:
  https://www.typingtest.com/
  https://first20hours.com/typing/
  https://code.google.com/archive/p/amphetype/
  https://colemak.com/
  https://www.keybr.com/profile
  https://www.typing.com/student/lesson/328/common-english-words
  https://www.speedtypingonline.com/typing-tutor

  https://www.computerhope.com/issues/ch001346.htm
  https://comp.editors.narkive.com/UFCzZ2RJ/touch-typing-for-programmers

  How to Calculate Typing Speed (WPM) and Accuracy
  https://www.speedtypingonline.com/typing-equations

  keyboard finger position
  https://www.computerhope.com/issues/ch001346.htm
 */

 /* 
  PLAN OF ATTACK
  Functions to make sense of
  [x] start_stats
  [x] update_stats
  [ ] set_level
  [ ] set_layout
  [ ] keyHandler
  [ ] next_word
  [ ] level_up
  [x] save
  [x] load
  [ ] render
  [ ] render_layout
  [ ] render_level
  [ ] render_rigor
  [ ] render_stats
  [ ] inc_rigor
  [ ] render_level_bar
  [ ] render_word
  [ ] generate_word
  [x] get_level_chars
  [ ] get_training_chars
  [x] choose





  */

var data = {};
data.chars = " jfkdlsahgyturieowpqbnvmcxz6758493021`-=[]\\;',./ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
data.consecutive = 5;
data.word_length = 8;
data.current_layout = "qwerty";



/* cos'è un layout, sembra una stringa e basta, ma non mi è chiara l associazione con la ui, è l'ordine con cui devo padroneggiare le lettere? */
var layouts = {};
layouts["qwerty"] = " jfkdlsahgyturieowpqbnvmcxz6758493021`-=[]\\;',./ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
layouts["azerty"] = " jfkdlsmqhgyturieozpabnvcxw6758493021`-=[]\\;',./ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
layouts["colemak"] = " ntesiroahdjglpufywqbkvmcxz1234567890'\",.!?:;/@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
layouts["norman"] = " ntieosaygjkufrdlw;qbpvmcxz1234567890'\",.!?:;/@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\";
layouts["code-es6"] = " {}',;():.>=</_-|`!?#[]\\+\"@$%&*~^";

$(document).ready(function() {
    if (localStorage.data != undefined) {
        load();
        render();
    }
    else {
        set_level(1);
    }
    $(document).keypress(keyHandler);
});


var start_time = 0;
/* - viene chiamata in keyHandler, on keypress
   - div.stats
*/
function start_stats() {
    /* 
      quando start_time è 0, assegna il tempo in sec
      quando start_time è > 0, assegna il momento attuale
     */
    start_time = start_time || Math.floor(new Date().getTime() / 1000);
}


var hpm = 0; /* hits per minute */
var ratio = 0;
var hits_correct = 0;
var hits_wrong = 0;
function update_stats() {
  if (start_time) {
    var current_time = (Math.floor(new Date().getTime() / 1000));
    /* better than "ration": correct hits %, see also render_stats(), the author knows it! */
    ratio = Math.floor(hits_correct / (hits_correct + hits_wrong) * 100);
    /* total hits per minute */
    hpm = Math.floor((hits_correct + hits_wrong) / (current_time - start_time) * 60);
    /* 
      built-in function that "returns false if the argument is positive or negative Infinity or NaN or undefined; otherwise, true."
      if total hits per minute is not a finite number, then set it to 0
     */
    if (!isFinite(hpm)) {
      hpm = 0;
    }
  }
}

function set_level(l) {
    data.in_a_row = {};
    for(var i = 0; i < data.chars.length; i++) {
        data.in_a_row[data.chars[i]] = data.consecutive;
    }
    data.in_a_row[data.chars[l]] = 0;
    data.level = l;
    data.word_index = 0;
    data.word_errors = {};
    data.word = generate_word();
    data.keys_hit = "";
    save();
    render();
}

/*
var data = {};
data.chars = " jfkdlsahgyturieowpqbnvmcxz6758493021`-=[]\\;',./ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
data.consecutive = 5;
data.word_length = 7;
data.current_layout = "qwerty";

var layouts = {};
layouts["qwerty"] = ...

- takes l, layout
- 
 
 */
function set_layout(l) {
  /* sovrascrivo il default "qwerty" con l */
  data.current_layout = l
  /* set data.chars alla string a cui punta layouts[l]
  quindi, se layouts[l] è "colemak", data.chars corrisponderà a " ntesiroahdjglpufywqbkvmcxz1234567890'\",.!?:;/@$%&#*()_ABCDEFGHIJKLMNOPQRSTUVWXYZ~+-={}|^<>`[]\\"
   */
  data.chars = layouts[l];
  data.in_a_row = {};
  /* 
  {
    " ": 5,
    "n": 5,
    "t": 5,
    ...
  }
   */
  for(var i = 0; i < data.chars.length; i++) {
    data.in_a_row[data.chars[i]] = data.consecutive;
  }
  data.word_index = 0;
  data.word_errors = {};
  data.word = generate_word();
  data.keys_hit = "";
  save();
  render();
}

function keyHandler(e) {
    start_stats();

    var key = String.fromCharCode(e.which);
    if (data.chars.indexOf(key) > -1){
        e.preventDefault();
    }
    else {
    	return;
    }
    data.keys_hit += key;
    if(key == data.word[data.word_index]) {
        hits_correct += 1;
        data.in_a_row[key] += 1;
        (new Audio("click.wav")).play();
    }
    else {
        hits_wrong += 1;
        data.in_a_row[data.word[data.word_index]] = 0;
        data.in_a_row[key] = 0;
        (new Audio("clack.wav")).play();
        data.word_errors[data.word_index] = true;
    }
    data.word_index += 1;
    if (data.word_index >= data.word.length) {
        setTimeout(next_word, 400);
    }

    update_stats();

    render();
    save();
}

function next_word(){
  if(get_training_chars().length == 0) {
    level_up();
  }
  data.word = generate_word();
  data.word_index = 0;
  data.keys_hit = "";
  data.word_errors = {};
  update_stats();

    render();
    save();
}

function level_up() {
    if (data.level + 1 <= data.chars.length - 1) {
        (new Audio('ding.wav')).play();
    }
    l = Math.min(data.level + 1, data.chars.length);
    set_level(l);
}

/*
  - helper to save data into localStorage.
  - viene usato 4 volte
*/
function save() {
    localStorage.data = JSON.stringify(data);
}

/*
  - retrieve data from localStorage
  - usata 1 volta!
*/
function load() {
    data = JSON.parse(localStorage.data);
}

function render() {
    render_layout();
    render_level();
    render_word();
    render_level_bar();
    render_rigor();
    render_stats();
}

function render_layout() {
	var layouts_html = "<span id='layout'>";
	for(var layout in layouts){
		if(data.current_layout == layout){
			layouts_html += "<span style='color: #F00' onclick='set_layout(\"" + layout + "\");'> "
		} else {
		 layouts_html += "<span style='color: #AAA' onclick='set_layout(\"" + layout + "\");'> "
		}
		layouts_html += layout + "</span>";
	}
	layouts_html += "</span>";
	$("#layout").html('Choose layout : ' + layouts_html);
}

function render_level() {
    var chars = "<span id='level-chars-wrap'>";
    var level_chars = get_level_chars();
    var training_chars = get_training_chars();
    for (var c in data.chars) {
        if(training_chars.indexOf(data.chars[c]) != -1) {
            chars += "<span style='color: #F00' onclick='set_level(" + c + ");'>"
        }
        else if (level_chars.indexOf(data.chars[c]) != -1) {
            chars += "<span style='color: #000' onclick='set_level(" + c + ");'>"
        }
        else {
            chars += "<span style='color: #AAA' onclick='set_level(" + c + ");'>"
        }
        if (data.chars[c] == ' ') {
            chars += "&#9141;";
        }
        else {
            chars += data.chars[c];
        }
        chars += "</span>";
    }
    chars += "</span>";
    $("#level-chars").html('click to set level: ' + chars);
}

function render_rigor() {
    chars = "<span id='rigor-number' onclick='inc_rigor();'>";
    chars += '' + data.consecutive;
    chars += '<span>';
    $('#rigor').html('click to set required repititions: ' + chars);
}

function render_stats() {
    $("#stats").text([
        "hits per minute: ", hpm, " ",
        "correctness: ", ratio, "%"
    ].join(""));
}

function inc_rigor() {
    data.consecutive += 1;
    if (data.consecutive > 9) {
        data.consecutive = 2;
    }
    render_rigor();
}

function render_level_bar() {
    training_chars = get_training_chars();
    if(training_chars.length == 0) {
        m = data.consecutive;
    }
    else {
        m = 1e100;
        for(c in training_chars) {
            m = Math.min(data.in_a_row[training_chars[c]], m);
        }
    }
    m = Math.floor($('#level-chars-wrap').innerWidth() * Math.min(1.0, m / data.consecutive));
    $('#next-level').css({'width': '' + m + 'px'});
    
}   

function render_word() {
    var word = "";
    for (var i = 0; i < data.word.length; i++) {
        sclass = "normalChar";
        if (i > data.word_index) {
            sclass = "normalChar";
        }
        else if (i == data.word_index) {
            sclass = "currentChar";
        }
        else if(data.word_errors[i]) {
            sclass = "errorChar";
        }
        else {
            sclass = "goodChar";
        }
        word += "<span class='" + sclass + "'>";
        if(data.word[i] == " ") {
            word += "&#9141;"
        }
        else if(data.word[i] == "&") {
            word += "&amp;"
        }
        else {
            word += data.word[i];
        }
        word += "</span>";
    }
    var keys_hit = "<span class='keys-hit'>";
    for(var d in data.keys_hit) {
        if (data.keys_hit[d] == ' ') {
            keys_hit += "&#9141;";
        }
        else if (data.keys_hit[d] == '&') {
            keys_hit += "&amp;";
        }
        else {
            keys_hit += data.keys_hit[d];
        }
    }
    for(var i = data.word_index; i < data.word_length; i++) {
        keys_hit += "&nbsp;";
    }
    keys_hit += "</span>";
    $("#word").html(word + "<br>" + keys_hit);
}

/*
  - take nothing
  - return word
*/
function generate_word() {
  /* manca var, quindi word diventa global */
  word = '';
  for(var i = 0; i < data.word_length; i++) {
    /*  
    */
    c = choose(get_training_chars());
    if(c != undefined && c != word[word.length - 1]) {
      word += c;
    }
    else {
      word += choose(get_level_chars());
    }
  }
  return word;
}

/*
if 
  chars = " jfkdlsahgyturieowpqbnvmcxz6758493021`-=[]\\;',./ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:\"<>?";
  level = "s"
then
  return ["j", "f", "k", "d", "l", "s"] 

return the list of chars to train, according to choosen level
*/
function get_level_chars() {
  return data.chars.slice(0, data.level + 1).split('');
}

/* TODO
  - 
 */
function get_training_chars() {
  var training_chars = [];
  var level_chars = get_level_chars();
  for (var x in level_chars) {
    if (data.in_a_row[level_chars[x]] < data.consecutive) {
      training_chars.push(level_chars[x]);
    }
  }
  return training_chars;
}

/*
- guess: a is for array
- Math.random() mi da un numero random tra 0 e 1
- Math.random() * a.length mi da un numero random tra 0 e a.length
- Math.floor(Math.random() * a.length) mi da un numero intero random tra 0 e a.length
- return a random element of array a
*/
function choose(a) {
  return a[Math.floor(Math.random() * a.length)];
}
