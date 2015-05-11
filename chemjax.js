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
	String.prototype.splice = function( idx, s, rem) {
		rem = rem || 0;
    	return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
	};

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

	/** Automatically subscript for chemical compounds **/
	filterForChemSubscripts = function(str){

		/* Regex excludes logs */
		var chems = str.match(/[a-z]+[0-9]+/gi);

		if (chems){
			for (var i = 0; i < chems.length; i++){

			  /* If a number follows a letter, prefix it with an underscore and suffix it with a space */
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
		var chems = str.match(/[a-z]+[_0-9]*\^[-0-9]+/gi);

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

	/** Returns a string filtered thoroughly as a chemical equation **/
	String.prototype.filterForChemistry = function(){
		var self = this;

		self = filterTwoWayArrows(self);
		self = filterForChemSubscripts(self);
		self = filterForChemSuperscripts(self);

		return self;
	}
})();
