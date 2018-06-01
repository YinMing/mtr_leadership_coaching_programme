var score=0;
var fullmark=0;
var numOfQuestion=0;
var currentQ=0;
var dom;

//change the index of choices into alphabet
function getChoice(index){
	var char="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var mcChoice="";
	if(index<26)
		mcChoice+=char[index];
	else{
		mcChoice+=getChoice(parseInt(index/26)-1)+getChoice(index%26);
	}
	return mcChoice;
}

function readMC(i, v){
    var newQ="";
    var numOfChoice=v['choices'].length;
    if(v['choices'][0]['imageUrl'])
        newQ+='<div class="row">';
    $.each(v['choices'], function(j, value){
        if(value['imageUrl']){
            newQ+="<div class='col-lg-"+12/numOfChoice+" col-md-4 col-sm-6 col-xs-12 choices_with_image'>";
            newQ+="<img class='choice_img' style='width:100%;' src='"+value['imageUrl']+"'>";
            if(v['type']=="radio")
                newQ+="<input type='radio' name='question-"+i+"' correct="+value['isCorrect']+" weight="+v['weight']+" Qtype='radio'>";
            else if(v['type']=="checkbox")
                newQ+="<input type='checkbox' name='question-"+i+"' correct="+value['isCorrect']+" weight="+v['weight']+" Qtype='checkbox'>";                            
            newQ+="<label for='question-"+i+"' class='mc_label' >"+getChoice(j)+". </label>";
            newQ+="<div class='mc_content' style='display:inline-block'>"+value['content']+"</div></div>";
        }
        else{
            if(v['type']=="radio")
                newQ+="<div><input type='radio' name='question-"+i+"' correct="+value['isCorrect']+" weight="+v['weight']+" Qtype='radio'>";
            else if(v['type']=="checkbox")
                newQ+="<div><input type='checkbox' name='question-"+i+"' correct="+value['isCorrect']+" weight="+v['weight']+" Qtype='checkbox'>"; 
            newQ+="<label for='question-"+i+"' class='mc_label' >"+getChoice(j)+". </label>";
            newQ+="<span class='mc_content'>"+value['content']+"</span></div>";
        }
    });
    if(v['choices'][0]['imageUrl'])
        newQ+='</div>';
    return newQ;
}

function readCloze(i, v){
    var newQ="";
    var content=v['content'].split("_");
    for(var j=0; j<v['answer'].length; j++){
        newQ+="<label for='question-"+i+"' class='nonMC_label'>"+content[j]+"</label>";
        newQ+="<input type='text' weight='"+v['weight']+"' answer='"+v['answer'][j]+"' name='question-"+i+"' Qtype='cloze'>";
    }
    newQ+="<label for='question-"+i+"' class='nonMC_label'>"+content[content.length-1]+"</label>";
    return newQ;
}

function readDropList(i, v){
    var newQ="";
    var content=v['content'].split("_");
    newQ+="<label for='question-"+i+"' class='nonMC_label'>"+content[0]+"</label>";
    newQ+="<select Qtype='droplist' name='question-"+i+"' weight="+v['weight']+">";
    $.each(v['choices'], function(j, value){
        newQ+="<option value="+value['isCorrect']+">"+value['content']+"</option>";
    });
    newQ+="</select>";
    newQ+="<label for='question-"+i+"' class='nonMC_label'>"+content[1]+"</label>";
    return newQ;
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    if($(ev.target).hasClass('choice_img'))
        ev.dataTransfer.setData("text", $(ev.target).parent().attr('id'));
    else
        ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    console.log(ev.target);
    var data = ev.dataTransfer.getData("text");
    if($(ev.target).hasClass("drop_pool"))
        ev.target.appendChild(document.getElementById(data));
    else if($(ev.target).hasClass("mc_content") || $(ev.target).hasClass("choice_img")){
        $(ev.target).parent().parent().append(document.getElementById(data));
    }
    else if($(ev.target).hasClass("drag_choices")){
        $(ev.target).parent().append(document.getElementById(data));
    }
}

function readDragDrop(i, v){
    var numOfChoice=v['choices'].length;
    var newQ='<div class="row col-lg-12 col-md-12 co-sm-12 drag_choice_pool drop_pool" ondrop="drop(event)" ondragover="allowDrop(event)">';
    $.each(v['choices'], function(j, value){
        if(value['imageUrl']){
            newQ+="<div class='col-12 drag_choices choices_with_image' id='drag_choice-"+j+"-"+i+"' draggable='true' ondragstart='drag(event)'>";
            newQ+="<img class='choice_img' style='width:100%;' src='"+value['imageUrl']+"'>"; 
        }
        else
            newQ+="<div class='col-12 drag_choices' id='drag_choice-"+j+"-"+i+"' draggable='true' ondragstart='drag(event)'>";
        newQ+="<div class='mc_content' style='display:inline-block'>"+value['content']+"</div></div>";
    });
    newQ+="</div>";
    newQ+='<div class="row col-12">';
    numOfChoice=v['matchcontent'].length;
    $.each(v['matchcontent'], function(j, value){
        newQ+="<div class='col-12'>"; 
        newQ+="<div class='mc_content'>"+value['content']+"</div>";
        newQ+="<div class='drop_pool row' ondrop='drop(event)' ondragover='allowDrop(event)' name='question-"+i+"' answer='"+value['answer']+"' Qtype='dragdrop' weight="+v['weight']+"></div>";
        newQ+="</div>";
    });
    newQ+="</div>";
    return newQ;
}

//read the json file and display the questions into the DOM with id==domid
function readFile(domid){
    fullmark=0;
    numOfQuestion=data.length;    
    dom=domid;
    currentQ=0;
    score=0;
    $("#"+dom).empty();
    $.each(data, function(i, v){
        var newQ="<div class='Question card' style='display:none;' id="+i+">";
        if(v['imageUrl'])
            newQ+="<img class='question_img' src='"+v['imageUrl']+"'>";
        newQ+="<div class='card-body'><h6 class='question_content card-title'>"+v['question']+"</h6>";
        newQ+="<p class='question_description'>"+v['description']+"</p>";
        fullmark+=v['weight'];
        switch(v['type']){
            case "radio":
            case "checkbox":
                newQ+=readMC(i, v);
                break;
            case "cloze":
                newQ+=readCloze(i, v);
                break;
            case "droplist":
                newQ+=readDropList(i, v);
                break;
            case "dragdrop":
                newQ+=readDragDrop(i, v);
        }
        newQ+="</div>";
        $("#"+dom).append(newQ);
    });

}

//check if the input answer to the specified question is correct and return the score of this question
function checkAnswer(question, type){
    correct=true;
    $(question).each(function(index, value){
        switch(type){
            case "radio":
            case "checkbox":
                if($(this).attr('correct')==1){
                    if(this.checked==true)
                        $(this).siblings().css({'color':'#51e23b'});
                    else{
                        $(this).siblings().css({'color':'red'});
                        correct=false;
                    }
                }
                else{
                    if(this.checked==true){
                        if(type=="checkbox")
                            $(this).siblings().css({'color':'red'});
                        correct=false;
                    }
                }
                break;
            case "cloze":
                if($(this).val()==$(this).attr("answer")){
                    $(this).css({'color':'#51e23b'});
                }
                else{
                    $(this).css({'color':'red'});
                    correct=false;
                }
                break;
            case "droplist":
                if($(this).val()==1)
                    $(this).css({'color':'#51e23b'});
                else{
                    $(this).css({'color':'red'});
                    correct=false;
                }
                break;
            case "dragdrop":
                var dragdropscore = 0;
                var answers=$(this).attr('answer').split(',');
				var redChild = $(this).children('.drag_choices');
                redChild.css({'border':'red 1px solid'});
				redChild.children().addClass('wrong-ans');
                if(redChild.length!=answers.length){
                    correct=false;
                }
                for(var i=0; i<answers.length; i++){
					var child = $(this).children('[id^=drag_choice-'+answers[i]+']');
                    if($(this).children('[id^=drag_choice-'+answers[i]+']').length==0){
                        correct=false;
                    }
                    else{
                        child.css({'border':'#51e23b 1px solid'});
						child.children().append(' - &#10004;');
						child.children().removeClass('wrong-ans');
                        dragdropscore += 1;
                    }
                }
				
				score += dragdropscore;
                return dragdropscore;
                break;
        }
    });
    if(correct==false)
        return 0;
    return parseInt($(question[0]).attr('weight'));
}

//check the answer to all the questions and update the score
function getResult(){
	score=0;
    $("[name^=question-]").siblings().css({'color':'black'});

    for(var i=0; i<numOfQuestion; i++){
        question=$("[name=question-"+i);
        checkAnswer(question, $(question[0]).attr("Qtype"));
    }
	console.log('score', score);
	$('.wrong-ans').each(function(){
		$(this).append(' - &#10006;');
	})
}

function displayQuestion(q){
    if(q<numOfQuestion && q>=0){
        questions=$(".Question");
        for(var i=0; i<questions.length; i++){
            if(i==q)
                $("#"+i).css({"display":""});
            else
                $("#"+i).css({"display":"none"});
        }
        currentQ=q;
    }
}

function displayAllQuestion(){
    questions=$(".Question");
    for(var i=0; i<questions.length; i++)
        $("#"+i).css({"display":"", "min-height":""});
    currentQ=0;
}


//return the score of last submit
function getScore(){
    return score;
}

//get the total score of the exercise (full mark)
function getfullmark(){
    return fullmark;
}

//get total number of questions
function getNumOfQuestion(){
    return numOfQuestion;   
}

//get current question
function getCurrentQuestion(){
    return currentQ;
};
