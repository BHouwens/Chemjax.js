/***

	Chemjax.js is a small add-on for Mathjax that specifically handles live previews
	of chemical and scientific notation from plain text, which Mathjax can't do
	out the box.

***/

(function safety(){

	/** Give cloning ability to strings **/
	String.prototype.clone = function(){
		return this;
	}

	/** Splice the second argument into index at idx **/
	String.prototype.splice = function(idx, s) {
    	return (this.slice(0,idx) + s + this.slice(idx));
	};

	/** Reverse a string **/
	String.prototype.reverse = function(){
		return this.split("").reverse().join("");
	}

	/** Filter for preview screw ups when combining subscripts and superscripts **/
	filterSubscriptScrewUp = function(str){
		var stuffUps = str.match(/[a-z]*[0-9]*\^[0-9]+_[0-9]+/gi);

		if (stuffUps){
			for (var i = 0; i < stuffUps.length; i++){

				/* Summary - Split the first and second sets of numbers, switch them,
							 and then replace the initial caret with an underscore.
				*/
				var elem = stuffUps[i],
					replacement = elem.clone(),
					caretIndex = elem.indexOf(elem.match(/\^/)),
					underscoreIndex = elem.indexOf(elem.match(/_/)),
					firstNums = elem.substring(caretIndex + 1, underscoreIndex),
					secondNums = elem.substring(underscoreIndex + 1, elem.length);

				replacement = elem.replace(firstNums, secondNums);
				replacement = replacement.replace('_'+secondNums, '^'+firstNums);
				replacement = replacement.replace('^', '_');

				str = str.replace(elem, replacement);
			}
		}

		return str;
	}

	/** Automatically superscript for spectroscopic inputs **/
	filterForSpecSuperscripts = function(str){
		var specs = str.match(/[a-z]+[0-9]+/gi);

		if (specs){
			for (var i = 0; i < specs.length; i++){

				/* If a number follows a letter, prefix it with a caret */
			  	var elem = specs[i];
			      	firstDigit = elem.match(/[0-9]/),
			        firstIndex = elem.indexOf(firstDigit),
			      	splicedString = elem.splice(firstIndex, '^');
		  		  
		  		str = str.replace(elem, splicedString);
			}
		} 

		return str;
	}

	/** Filter forward and back slashes as pipe characters **/
	filterPipes = function(str){
		str = str.replace(/\\/g, '|');
		str = str.replace(/\//g, '|');
		str = str.replace(/\|/g, '|');

		return str;
	}

	/** Filter less-than-equal-to to a left arrow for chemistry **/
	filterLessThan = function(str){
		str = str.replace(/\<\=/g, '\\Leftarrow');

		return str;
	}

	/** Filter left arrow **/
	filterLeftArrow = function(str){
		str = str.replace(/\<\-/g, '\\leftarrow');

		return str;
	}

	/** 

	Automatically convert text inputs to text mode in preview.
	Don't touch this damn function unless something radically changes
	in the way Mathjax renders text. It is in extremely delicate balance.

	**/
	filterToText = function(str){
		/* Exclude all ees and tees in \text{} */
		var texts = str.match(/(?!t|x|e)([a-z]){1,1}/gi),
			tees = str.match(/(?!\\|x)(t)/g),
			ees = str.match(/(e)(?!x)/g),
			pipes = str.match(/\|/g),
			uppercases = ['T', 'E', 'X'],
			covered = [];

		if (tees){
			str = str.replace(/(?!\\|x)(t)/g, '\\text{t}');
		}

		if (ees){
			str = str.replace(/(e)(?!x)/g, '\\text{e}');
		}

		if (pipes){
			str = str.replace(/\|/g, '\\text{|}');
		}

		/* Render all uppercase Ts, Es and Xs */
		for (var i = 0; i < uppercases.length; i++){
			var match = new RegExp(uppercases[i], "g");

			if (str.match(match)){
				str = str.replace(match, '\\text{'+uppercases[i]+'}');
			}
		}

		if (texts){
			for (var i = 0; i < texts.length; i++){
              var there = false;
              
              /* Check if the match has already been covered before */
              for (var j = 0; j < covered.length; j++){
                if (texts[i] == covered[j]){
                  there = true;
                  break;
                }
              }
              
              /* If the match is not in the array */
              if (!there){
                    var elem = texts[i],
                    	reg = new RegExp(elem, "g");
                
					covered.push(elem);
                    str = str.replace(reg, '\\text{'+elem+'}');
              }
			}
		}

		return str;
	}

	/** Automatically subscript for chemical compounds **/
	filterForChemSubscripts = function(str){
		var chems = str.match(/[)a-z]+[0-9]+/gi);

		if (chems){
			for (var i = 0; i < chems.length; i++){

			  /* If a number follows a letter or closing bracket, prefix it with an underscore */
		  	  var elem = chems[i],
		      	  firstDigit = elem.match(/[0-9]/),
		          firstIndex = elem.indexOf(firstDigit),
		      	  splicedString = elem.splice(firstIndex, '_');
	  		  
	  		  str = str.replace(elem, splicedString);

			}
		}

		return str;
	}

	/** Ensure valid chemistry superscripts work **/
	filterForChemSuperscripts = function(str){
		var chems = str.match(/[a-z]+[_0-9]*\^[0-9]*[-+]{1,1}/gi);

		if (chems){
			for (var i = 0; i < chems.length; i++){
				var elem = chems[i],
					caretIndex = elem.indexOf('^'),
					splicedString = elem.splice(caretIndex+1, '(');

				splicedString += ')';
				str = str.replace(elem, splicedString);
			}
		}

		return str;
	}

	/** Convert two-way chemical arrows to the correct display **/
	filterTwoWayArrows = function(str){
		str = str.replace('<=>', '⇌');

		return str;
	}

	/** Convert double Cs into the correct display **/
	filterDoubleCs = function(str){
		str = str.replace(/CC/g, 'C C ');

		return str;
	}

	/** Convert all literal spaces into something MathJax will render **/
	filterForSpaces = function(str){
		str = str.replace(/\s/g, '\\quad');

		return str;
	}

	/** Returns a string filtered thoroughly as a chemical equation **/
	String.prototype.filterForChemistry = function(){
		var self = this;

		self = filterTwoWayArrows(self);
		self = filterDoubleCs(self);
		self = filterForChemSubscripts(self);
		self = filterForChemSuperscripts(self);
		self = filterPipes(self);	
		/* These filters MUST be called last and in this order. Don't question it, just do it */
		self = filterToText(self);
		self = filterLeftArrow(self);	
		self = filterLessThan(self);

		return self;
	}

	/** Returns a string filtered thoroughly for spectroscopic questions **/
	String.prototype.filterForSpectroscopic = function(){
		var self = this;

		self = filterForSpecSuperscripts(self);
		/* These filters MUST be called last and in this order. Don't question it, just do it */
		self = filterToText(self);
		self = filterForSpaces(self);

		return self;
	}
})();
