# Chemjax.js

Chemical and scientific notation add-on for Mathjax, for those who want to live preview from plain text.

## Requirements

Only Mathjax is necessary.

## How to Use

It's still in development, but the eventual idea is to create a "middleware" plugin that will intercept user input before it's passed to the Mathjax Hub.queue and filter it as a chemical or scientific statement/equation.

Thus, if you've called `chemjax.js` in the DOM and you have a live previewer like this:

	var Queue = Mathjax.Hub.queue;

    UpdateMath = function (newMath) {        
		Queue.Push(["Text", math, newMath]);
    }

You would intercept the `newMath` variable and filter it using `chemjax.js` like so:

	UpdateMath = function (newMath) { 
		newMath = newMath.filterForChemistry(); /* New line to add */

		Queue.Push(["Text", math, newMath]);
    }
